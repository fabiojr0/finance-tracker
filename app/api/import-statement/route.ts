import { NextRequest, NextResponse } from 'next/server'

interface CategoryInfo {
  id: string
  name: string
  type: string
}

interface RequestBody {
  text: string
  categories: CategoryInfo[]
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

  const { text, categories } = body

  if (!text || text.trim().length < 10) {
    return NextResponse.json(
      { error: 'Texto do extrato muito curto ou vazio' },
      { status: 400 }
    )
  }

  const categoriesText = categories.length > 0
    ? categories.map((c) => `- id: "${c.id}", nome: "${c.name}", tipo: "${c.type}"`).join('\n')
    : 'Nenhuma categoria disponível'

  const systemPrompt = `Você é um assistente que extrai transações financeiras de extratos bancários brasileiros.
Dado o texto de um extrato bancário, extraia TODAS as transações e retorne um JSON.

Cada transação deve ter:
- "type": "receita" para créditos/depósitos/salários, "despesa" para débitos/pagamentos/compras e transferencias para outras pessoas, "transferencia" para transferências entre contas do mesmo usuario, "investimento" para aplicações/investimentos
- "amount": número positivo (sem sinal negativo, ex: 150.50)
- "description": descrição limpa e legível da transação, não coloque coisas como compra no debito ou transferencia enviada/recebida, caso seja uma transferencia para alguém ou de alguém coloque apenas pix recebido/enviado e o nome e o ultimo nome da pessoa (3-40 caracteres)
- "date": data no formato YYYY-MM-DD
- "category_id": o id da categoria mais adequada da lista abaixo (ou null se nenhuma se aplicar)

Categorias disponíveis do usuário:
${categoriesText}

IMPORTANTE:
- Extraia TODAS as transações do extrato, não pule nenhuma
- O campo amount deve ser SEMPRE positivo
- Datas devem estar no formato YYYY-MM-DD
- Escolha a categoria mais adequada para cada transação baseado na descrição
- Retorne APENAS JSON válido, sem texto adicional

Retorne exatamente neste formato:
{ "transactions": [ { "type": "...", "amount": 0.00, "description": "...", "date": "YYYY-MM-DD", "category_id": "..." }, ... ] }`

  // 5-minute timeout
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
          { role: 'user', content: `Extraia as transações do seguinte extrato bancário:\n\n${text.slice(0, 50000)}` },
        ],
        temperature: 0.1,
        max_tokens: 16000,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter error:', errorText)
      return NextResponse.json(
        { error: `Erro na API: ${response.status}` },
        { status: 502 }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'Resposta vazia da IA' },
        { status: 502 }
      )
    }

    // Extract JSON from the response (handle markdown code blocks)
    let jsonStr = content.trim()
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    }

    const parsed = JSON.parse(jsonStr)
    const transactions = parsed.transactions || parsed

    if (!Array.isArray(transactions)) {
      return NextResponse.json(
        { error: 'Formato de resposta inválido da IA' },
        { status: 502 }
      )
    }

    return NextResponse.json({ transactions })
  } catch (err) {
    clearTimeout(timeoutId)

    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json(
        { error: 'A análise demorou mais de 5 minutos. Tente com um arquivo menor.' },
        { status: 504 }
      )
    }

    console.error('Import statement error:', err)
    return NextResponse.json(
      { error: 'Erro ao processar extrato' },
      { status: 500 }
    )
  }
}
