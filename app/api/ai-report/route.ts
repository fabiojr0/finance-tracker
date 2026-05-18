import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RequestBody {
  startDate: string
  endDate: string
  periodLabel?: string
  customPrompt?: string
}

interface AggregatedCategory {
  name: string
  type: string
  total: number
  count: number
}

interface TopExpense {
  description: string
  amount: number
  date: string
  category: string | null
}

interface MonthlyBucket {
  month: string
  income: number
  expenses: number
  investments: number
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7)
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

  const { startDate, endDate, periodLabel, customPrompt } = body

  if (!startDate || !endDate || !ISO_DATE.test(startDate) || !ISO_DATE.test(endDate)) {
    return NextResponse.json(
      { error: 'Datas inválidas. Use o formato YYYY-MM-DD.' },
      { status: 400 }
    )
  }

  if (startDate > endDate) {
    return NextResponse.json(
      { error: 'A data inicial deve ser anterior ou igual à final.' },
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

  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select(
      `id, type, amount, description, date, status,
       category:categories(name, type)`
    )
    .eq('user_id', user.id)
    .eq('status', 'concluida')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (txError) {
    console.error('AI report fetch error:', txError)
    return NextResponse.json(
      { error: 'Erro ao carregar transações' },
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
    category: { name: string; type: string } | null
  }

  const rows = (transactions as unknown as TxRow[]) ?? []

  if (rows.length === 0) {
    return NextResponse.json(
      { error: 'Nenhuma transação concluída encontrada no período selecionado.' },
      { status: 404 }
    )
  }

  let income = 0
  let expenses = 0
  let investments = 0
  const categoryMap = new Map<string, AggregatedCategory>()
  const monthMap = new Map<string, MonthlyBucket>()

  for (const tx of rows) {
    const amount = Number(tx.amount) || 0
    if (tx.type === 'receita') income += amount
    else if (tx.type === 'despesa') expenses += amount
    else if (tx.type === 'investimento') investments += amount

    const catName = tx.category?.name ?? 'Sem categoria'
    const catType = tx.category?.type ?? tx.type
    const catKey = `${catType}::${catName}`
    const existingCat = categoryMap.get(catKey)
    if (existingCat) {
      existingCat.total += amount
      existingCat.count += 1
    } else {
      categoryMap.set(catKey, { name: catName, type: catType, total: amount, count: 1 })
    }

    const mKey = monthKey(tx.date)
    const existingMonth = monthMap.get(mKey)
    if (existingMonth) {
      if (tx.type === 'receita') existingMonth.income += amount
      else if (tx.type === 'despesa') existingMonth.expenses += amount
      else if (tx.type === 'investimento') existingMonth.investments += amount
    } else {
      monthMap.set(mKey, {
        month: mKey,
        income: tx.type === 'receita' ? amount : 0,
        expenses: tx.type === 'despesa' ? amount : 0,
        investments: tx.type === 'investimento' ? amount : 0,
      })
    }
  }

  const expenseCategories = Array.from(categoryMap.values())
    .filter((c) => c.type === 'despesa')
    .sort((a, b) => b.total - a.total)
    .slice(0, 12)

  const incomeCategories = Array.from(categoryMap.values())
    .filter((c) => c.type === 'receita')
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)

  const topExpenses: TopExpense[] = rows
    .filter((t) => t.type === 'despesa')
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 15)
    .map((t) => ({
      description: t.description,
      amount: Number(t.amount),
      date: t.date,
      category: t.category?.name ?? null,
    }))

  const monthly = Array.from(monthMap.values()).sort((a, b) =>
    a.month.localeCompare(b.month)
  )

  const totalExpenses = expenses
  const expenseLines = expenseCategories
    .map((c) => {
      const pct = totalExpenses > 0 ? (c.total / totalExpenses) * 100 : 0
      return `  - ${c.name}: ${formatBRL(c.total)} (${pct.toFixed(1)}% das despesas, ${c.count} transações)`
    })
    .join('\n')

  const incomeLines = incomeCategories
    .map((c) => `  - ${c.name}: ${formatBRL(c.total)} (${c.count} transações)`)
    .join('\n')

  const monthlyLines = monthly
    .map(
      (m) =>
        `  - ${m.month}: receitas ${formatBRL(m.income)}, despesas ${formatBRL(m.expenses)}, investimentos ${formatBRL(m.investments)}`
    )
    .join('\n')

  const topLines = topExpenses
    .map(
      (t) =>
        `  - ${t.date} | ${formatBRL(t.amount)} | ${t.description}${t.category ? ` [${t.category}]` : ''}`
    )
    .join('\n')

  const periodInfo = periodLabel
    ? `${periodLabel} (${startDate} a ${endDate})`
    : `${startDate} a ${endDate}`

  const balance = income - expenses - investments
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : null

  const userInstruction = customPrompt && customPrompt.trim().length > 0
    ? `\n\nFOCO ADICIONAL PEDIDO PELO USUÁRIO (priorize esses pontos):\n${customPrompt.trim()}`
    : ''

  const dataSection = `DADOS AGREGADOS (já calculados — use exatamente esses números, não recalcule):

Período: ${periodInfo}
Quantidade de transações concluídas: ${rows.length}

Totais:
  - Receitas: ${formatBRL(income)}
  - Despesas: ${formatBRL(expenses)}
  - Investimentos: ${formatBRL(investments)}
  - Saldo (receitas - despesas - investimentos): ${formatBRL(balance)}
  - Taxa de poupança ((receitas - despesas) / receitas): ${savingsRate === null ? 'N/D' : `${savingsRate.toFixed(1)}%`}

Despesas por categoria (ordenado por valor):
${expenseLines || '  - (nenhuma)'}

Receitas por categoria (ordenado por valor):
${incomeLines || '  - (nenhuma)'}

Quebra mensal:
${monthlyLines || '  - (sem dados)'}

Maiores despesas individuais:
${topLines || '  - (nenhuma)'}`

  const systemPrompt = `Você é um consultor financeiro pessoal brasileiro. Receberá dados agregados de transações de um usuário e deve gerar um relatório claro, objetivo e útil, em português do Brasil.

REGRAS:
- Use APENAS os números fornecidos. Não invente nada.
- Sempre formate valores como Reais brasileiros (R$ 1.234,56).
- Seja específico: cite categorias, valores e percentuais reais dos dados.
- Tom: profissional, direto e construtivo. Sem floreios desnecessários.
- Aponte padrões relevantes (concentração em uma categoria, oscilação mês a mês, gasto único elevado etc.).
- Recomendações devem ser acionáveis e baseadas nos dados, não genéricas.

RETORNE APENAS JSON VÁLIDO, sem texto adicional, neste formato exato:
{
  "resumo": "string — parágrafo executivo de 2-4 frases com o panorama do período",
  "destaques": ["string", ...],            // 3 a 5 fatos numéricos importantes
  "categorias_principais": [               // 3 a 6 categorias de despesa mais relevantes
    {
      "nome": "string",
      "valor": number,                     // valor total em reais (apenas o número)
      "percentual": number,                // % do total de despesas (apenas o número)
      "observacao": "string"               // 1 frase de análise específica
    }
  ],
  "alertas": ["string", ...],              // 0 a 4 pontos de atenção (ex: gasto crescente, categoria desproporcional)
  "recomendacoes": ["string", ...]         // 3 a 5 sugestões acionáveis
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
          { role: 'user', content: `${dataSection}${userInstruction}\n\nGere o relatório no formato JSON solicitado.` },
        ],
        temperature: 0.3,
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
      return NextResponse.json(
        { error: 'Resposta vazia da IA' },
        { status: 502 }
      )
    }

    let jsonStr = content.trim()
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(jsonStr)
    } catch (parseErr) {
      console.error('AI report parse error:', parseErr, content)
      return NextResponse.json(
        { error: 'A IA retornou um formato inesperado. Tente novamente.' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      report: parsed,
      summary: {
        period: { start: startDate, end: endDate, label: periodLabel ?? null },
        income,
        expenses,
        investments,
        balance,
        savingsRate,
        transactionCount: rows.length,
      },
    })
  } catch (err) {
    clearTimeout(timeoutId)

    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json(
        { error: 'A análise demorou demais. Tente um período menor.' },
        { status: 504 }
      )
    }

    console.error('AI report error:', err)
    return NextResponse.json(
      { error: 'Erro ao gerar relatório com IA' },
      { status: 500 }
    )
  }
}
