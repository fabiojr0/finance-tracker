import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    let text: string

    if (file.name.toLowerCase().endsWith('.pdf')) {
      // Import pdfjs-dist only server-side in this route
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')

      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
      const textParts: string[] = []

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => item.str || '')
          .join(' ')
        textParts.push(pageText)
      }

      text = textParts.join('\n')
    } else if (file.name.toLowerCase().endsWith('.csv')) {
      text = Buffer.from(arrayBuffer).toString('utf-8')
    } else {
      return NextResponse.json({ error: 'Formato não suportado' }, { status: 400 })
    }

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        {
          error: file.name.toLowerCase().endsWith('.pdf')
            ? 'Não foi possível extrair texto do PDF. O arquivo pode ser escaneado/imagem. Tente exportar o extrato como CSV.'
            : 'O arquivo CSV está vazio ou não contém dados suficientes.',
        },
        { status: 422 }
      )
    }

    return NextResponse.json({ text })
  } catch (err) {
    console.error('Parse file error:', err)
    return NextResponse.json({ error: 'Erro ao processar arquivo' }, { status: 500 })
  }
}
