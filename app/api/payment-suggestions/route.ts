import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RequestBody {
  startDate: string
  endDate: string
  customPrompt?: string
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function nextMonthDate(fromISO: string): string {
  const [y, m, d] = fromISO.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setMonth(date.getMonth() + 1)
  const yy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENROUTER_API_KEY não configurada' },
      { status: 500 }
    )
  }

  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { startDate, endDate, customPrompt } = body

  if (!startDate || !endDate || !ISO_DATE.test(startDate) || !ISO_DATE.test(endDate)) {
    return NextResponse.json(
      { error: 'Datas inválidas. Use o formato YYYY-MM-DD.' },
      { status: 400 }
    )
  }

  if (startDate > endDate) {
    return NextResponse.json(
      { error: 'A data inicial deve ser anterior à final.' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const [{ data: txData, error: txErr }, { data: catData, error: catErr }] =
    await Promise.all([
      supabase
        .from('transactions')
        .select(
          `id, type, amount, description, date, status,
           category:categories(id, name, type)`
        )
        .eq('user_id', user.id)
        .eq('status', 'concluida')
        .in('type', ['despesa', 'transferencia', 'investimento'])
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true }),
      supabase
        .from('categories')
        .select('id, name, type')
        .eq('user_id', user.id)
        .eq('is_active', true),
    ])

  if (txErr || catErr) {
    console.error('Payment suggestions fetch error:', txErr || catErr)
    return NextResponse.json(
      { error: 'Erro ao carregar dados' },
      { status: 500 }
    )
  }

  type TxRow = {
    id: string
    type: string
    amount: number
    description: string
    date: string
    status: string
    category: { id: string; name: string; type: string } | null
  }
  type CatRow = { id: string; name: string; type: string }

  const transactions = (txData as unknown as TxRow[]) ?? []
  const categories = (catData as unknown as CatRow[]) ?? []

  if (transactions.length === 0) {
    return NextResponse.json(
      { error: 'Nenhuma transação concluída encontrada no período.' },
      { status: 404 }
    )
  }

  const txLines = transactions
    .map(
      (t) =>
        `- ${t.date} | ${t.type} | ${formatBRL(Number(t.amount))} | "${t.description}"${t.category ? ` | categoria: "${t.category.name}" (id: ${t.category.id})` : ''}`
    )
    .join('\n')

  const categoryLines = categories
    .filter((c) => c.type === 'despesa' || c.type === 'investimento')
    .map((c) => `  - id: "${c.id}", nome: "${c.name}", tipo: "${c.type}"`)
    .join('\n')

  const today = new Date()
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const fallbackNextDue = nextMonthDate(todayISO)

  const userInstruction = customPrompt && customPrompt.trim().length > 0
    ? `\n\nINSTRUÇÕES ADICIONAIS DO USUÁRIO:\n${customPrompt.trim()}`
    : ''

  const systemPrompt = `Você é um assistente financeiro brasileiro especializado em identificar pagamentos recorrentes e contas fixas.

OBJETIVO: A partir do histórico de transações concluídas do usuário, identifique pagamentos que se repetem (mensalmente, semanalmente, anualmente) ou contas previsíveis, e sugira novos pagamentos a serem agendados para os próximos meses.

REGRAS:
- Considere recorrente um pagamento que aparece em pelo menos 2 meses diferentes, com descrições semelhantes e valor estável (variação até 30%).
- Inclua também contas conhecidas (luz, água, internet, aluguel, mensalidades, assinaturas etc.) mesmo que apareçam só 1-2 vezes, se forem claramente recorrentes pela descrição.
- IGNORE compras avulsas, transferências esporádicas a pessoas, gastos únicos, restaurantes ocasionais.
- Para cada sugestão, calcule a próxima data de vencimento provável baseada no padrão observado. Se incerto, use ${fallbackNextDue}.
- A data sugerida deve ser FUTURA (após ${todayISO}). Se a última ocorrência foi recente, projete a próxima.
- Use o id de categoria mais adequado da lista do usuário (apenas categorias do tipo "despesa" ou "investimento"). Se nenhuma se encaixar, use null.
- Padronize descrições limpas e curtas (ex: "Internet - Vivo", "Aluguel", "Netflix").
- Sugira no máximo 15 itens. Priorize os mais relevantes (maior valor + maior frequência).

CATEGORIAS DISPONÍVEIS DO USUÁRIO:
${categoryLines || '  (nenhuma)'}

RETORNE APENAS JSON VÁLIDO neste formato exato:
{
  "suggestions": [
    {
      "description": "string — descrição limpa e curta",
      "amount": number — valor em reais (apenas número, sem símbolo),
      "due_date": "YYYY-MM-DD — próximo vencimento previsto, deve ser futuro",
      "type": "despesa" | "transferencia" | "investimento",
      "category_id": "string-uuid ou null",
      "recurrence": "mensal" | "semanal" | "anual" | "unica",
      "reason": "string — justificativa curta baseada nos dados (ex: 'aparece todo dia 10, últimos 3 meses')"
    }
  ]
}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 300000)

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-v3.2',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Data de hoje: ${todayISO}\n\nTransações concluídas do período ${startDate} a ${endDate}:\n\n${txLines}${userInstruction}\n\nGere as sugestões em JSON conforme as instruções.`,
          },
        ],
        temperature: 0.2,
        max_tokens: 4000,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter error:', errorText)
      return NextResponse.json(
        { error: `Erro na API de IA: ${response.status}` },
        { status: 502 }
      )
    }

    const data = await response.json()
    const content: string | undefined = data.choices?.[0]?.message?.content
    if (!content) {
      return NextResponse.json({ error: 'Resposta vazia da IA' }, { status: 502 })
    }

    let jsonStr = content.trim()
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) jsonStr = jsonMatch[1].trim()

    let parsed: { suggestions?: unknown }
    try {
      parsed = JSON.parse(jsonStr)
    } catch (parseErr) {
      console.error('Suggestions parse error:', parseErr, content)
      return NextResponse.json(
        { error: 'A IA retornou um formato inesperado. Tente novamente.' },
        { status: 502 }
      )
    }

    const raw = Array.isArray(parsed.suggestions) ? parsed.suggestions : []
    const validCategoryIds = new Set(categories.map((c) => c.id))
    const allowedTypes = new Set(['despesa', 'transferencia', 'investimento'])
    const allowedRecurrence = new Set(['mensal', 'semanal', 'anual', 'unica'])

    type Suggestion = {
      description: string
      amount: number
      due_date: string
      type: 'despesa' | 'transferencia' | 'investimento'
      category_id: string | null
      recurrence: 'mensal' | 'semanal' | 'anual' | 'unica'
      reason: string
    }

    const cleaned: Suggestion[] = []
    for (const item of raw) {
      if (!item || typeof item !== 'object') continue
      const obj = item as Record<string, unknown>
      const description = typeof obj.description === 'string' ? obj.description.trim() : ''
      const amount = typeof obj.amount === 'number' ? obj.amount : Number(obj.amount)
      const dueDate = typeof obj.due_date === 'string' ? obj.due_date : ''
      const type = typeof obj.type === 'string' ? obj.type : 'despesa'
      const categoryId = typeof obj.category_id === 'string' ? obj.category_id : null
      const recurrence = typeof obj.recurrence === 'string' ? obj.recurrence : 'mensal'
      const reason = typeof obj.reason === 'string' ? obj.reason : ''

      if (!description || !Number.isFinite(amount) || amount <= 0) continue
      if (!ISO_DATE.test(dueDate)) continue
      if (!allowedTypes.has(type)) continue
      if (!allowedRecurrence.has(recurrence)) continue

      cleaned.push({
        description: description.slice(0, 255),
        amount,
        due_date: dueDate,
        type: type as Suggestion['type'],
        category_id: categoryId && validCategoryIds.has(categoryId) ? categoryId : null,
        recurrence: recurrence as Suggestion['recurrence'],
        reason: reason.slice(0, 200),
      })
    }

    return NextResponse.json({ suggestions: cleaned })
  } catch (err) {
    clearTimeout(timeoutId)

    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json(
        { error: 'A análise demorou demais. Tente um período menor.' },
        { status: 504 }
      )
    }

    console.error('Payment suggestions error:', err)
    return NextResponse.json(
      { error: 'Erro ao gerar sugestões' },
      { status: 500 }
    )
  }
}
