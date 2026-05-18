import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({ error: 'Formato não suportado. Use CSV.' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const text = Buffer.from(arrayBuffer).toString('utf-8')

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: 'O arquivo CSV está vazio ou não contém dados suficientes.' },
        { status: 422 }
      )
    }

    return NextResponse.json({ text })
  } catch (err) {
    console.error('Parse file error:', err)
    return NextResponse.json({ error: 'Erro ao processar arquivo' }, { status: 500 })
  }
}
