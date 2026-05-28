import { describe, it, expect } from 'vitest'
import type { NextRequest } from 'next/server'
import { POST } from '@/app/api/parse-file/route'

function requestWithFile(file: File | null): NextRequest {
  const formData = new FormData()
  if (file) formData.set('file', file)
  return {
    formData: async () => formData,
  } as unknown as NextRequest
}

function csvFile(content: string, name = 'extrato.csv') {
  return new File([content], name, { type: 'text/csv' })
}

describe('POST /api/parse-file', () => {
  it('returns 400 when no file is sent', async () => {
    const res = await POST(requestWithFile(null))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Nenhum arquivo enviado' })
  })

  it('returns 400 for a non-CSV file', async () => {
    const res = await POST(requestWithFile(new File(['data'], 'extrato.pdf', { type: 'application/pdf' })))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Formato não suportado. Use CSV.' })
  })

  it('returns 422 when the CSV is empty or too short', async () => {
    const res = await POST(requestWithFile(csvFile('a,b')))
    expect(res.status).toBe(422)
    expect((await res.json()).error).toMatch(/vazio/)
  })

  it('returns the file text for a valid CSV', async () => {
    const content = 'data,descricao,valor\n2026-05-01,Mercado,99.90'
    const res = await POST(requestWithFile(csvFile(content)))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ text: content })
  })

  it('accepts uppercase .CSV extensions', async () => {
    const content = 'data,descricao,valor\n2026-05-01,Mercado,99.90'
    const res = await POST(requestWithFile(csvFile(content, 'EXTRATO.CSV')))
    expect(res.status).toBe(200)
  })

  it('returns 500 when reading the form data throws', async () => {
    const badRequest = {
      formData: async () => {
        throw new Error('boom')
      },
    } as unknown as NextRequest
    const res = await POST(badRequest)
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'Erro ao processar arquivo' })
  })
})
