import Papa from 'papaparse'

export async function extractTextFromCSV(file: File): Promise<string> {
  const text = await file.text()

  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    delimiter: '', // auto-detect
  })

  if (result.errors.length > 0 && result.data.length === 0) {
    throw new Error('Erro ao processar CSV: ' + result.errors[0].message)
  }

  // Convert parsed rows back to readable text for the AI
  const headers = result.meta.fields || []
  const lines = [headers.join(' | ')]

  for (const row of result.data as Record<string, string>[]) {
    const values = headers.map((h) => row[h] || '')
    lines.push(values.join(' | '))
  }

  return lines.join('\n')
}
