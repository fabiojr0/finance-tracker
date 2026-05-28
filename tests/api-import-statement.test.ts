import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { NextRequest } from 'next/server'
import { POST } from '@/app/api/import-statement/route'
import { okCompletion, errorResponse } from './helpers/supabase'

const jsonRequest = (body: unknown): NextRequest =>
  ({ json: async () => body }) as unknown as NextRequest

const sampleText = 'Extrato bancário com várias transações de exemplo'
const categories = [{ id: 'cat-1', name: 'Mercado', type: 'despesa' }]

function fetchMock() {
  return global.fetch as unknown as ReturnType<typeof vi.fn>
}

beforeEach(() => {
  vi.stubEnv('OPENROUTER_API_KEY', 'test-key')
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('POST /api/import-statement', () => {
  it('returns 500 when the API key is missing', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', '')
    const res = await POST(jsonRequest({ text: sampleText, categories }))
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'OPENROUTER_API_KEY não configurada' })
  })

  it('returns 400 for an invalid JSON body', async () => {
    const res = await POST({
      json: async () => {
        throw new Error('bad json')
      },
    } as unknown as NextRequest)
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Body inválido' })
  })

  it('returns 400 when the statement text is too short', async () => {
    const res = await POST(jsonRequest({ text: 'curto', categories }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/muito curto/)
  })

  it('parses transactions from a markdown-fenced JSON response', async () => {
    const aiContent = '```json\n{"transactions":[{"type":"despesa","amount":99.9,"description":"Mercado","date":"2026-05-01"}]}\n```'
    fetchMock().mockResolvedValue(okCompletion(aiContent))

    const res = await POST(jsonRequest({ text: sampleText, categories }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.transactions).toHaveLength(1)
    expect(body.transactions[0].description).toBe('Mercado')
  })

  it('parses a plain (non-fenced) JSON response', async () => {
    fetchMock().mockResolvedValue(
      okCompletion('{"transactions":[{"type":"receita","amount":10,"description":"X","date":"2026-01-01"}]}')
    )
    const res = await POST(jsonRequest({ text: sampleText, categories }))
    expect(res.status).toBe(200)
    expect((await res.json()).transactions).toHaveLength(1)
  })

  it('returns 502 when the AI response is not an array', async () => {
    fetchMock().mockResolvedValue(okCompletion('{"foo":1}'))
    const res = await POST(jsonRequest({ text: sampleText, categories }))
    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({ error: 'Formato de resposta inválido da IA' })
  })

  it('returns 502 when OpenRouter responds with an error status', async () => {
    fetchMock().mockResolvedValue(errorResponse(429))
    const res = await POST(jsonRequest({ text: sampleText, categories }))
    expect(res.status).toBe(502)
    expect((await res.json()).error).toBe('Erro na API: 429')
  })

  it('returns 502 when the AI response content is empty', async () => {
    fetchMock().mockResolvedValue(okCompletion(''))
    const res = await POST(jsonRequest({ text: sampleText, categories }))
    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({ error: 'Resposta vazia da IA' })
  })

  it('returns 500 when the AI returns invalid JSON', async () => {
    fetchMock().mockResolvedValue(okCompletion('not valid json {'))
    const res = await POST(jsonRequest({ text: sampleText, categories }))
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'Erro ao processar extrato' })
  })

  it('returns 504 when the request is aborted (timeout)', async () => {
    const abortErr = new Error('aborted')
    abortErr.name = 'AbortError'
    fetchMock().mockRejectedValue(abortErr)
    const res = await POST(jsonRequest({ text: sampleText, categories }))
    expect(res.status).toBe(504)
    expect((await res.json()).error).toMatch(/5 minutos/)
  })

  it('injects ignore-word and name-style instructions into the prompt', async () => {
    fetchMock().mockResolvedValue(okCompletion('{"transactions":[]}'))
    await POST(
      jsonRequest({
        text: sampleText,
        categories,
        options: { ignoreWords: ['saldo', 'rendimento'], nameStyle: 'curto' },
      })
    )
    const requestInit = fetchMock().mock.calls[0][1] as RequestInit
    const sentBody = JSON.parse(requestInit.body as string)
    const systemPrompt = sentBody.messages[0].content as string
    expect(systemPrompt).toContain('"saldo"')
    expect(systemPrompt).toContain('"rendimento"')
    expect(systemPrompt).toContain('APENAS o primeiro nome')
  })
})
