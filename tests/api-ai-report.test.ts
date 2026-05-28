import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { NextRequest } from 'next/server'
import { createSupabaseMock, okCompletion, errorResponse, type QueryResult } from './helpers/supabase'

const { createClientMock } = vi.hoisted(() => ({ createClientMock: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({ createClient: createClientMock }))

import { POST } from '@/app/api/ai-report/route'

const jsonRequest = (body: unknown): NextRequest =>
  ({ json: async () => body }) as unknown as NextRequest

const fetchMock = () => global.fetch as unknown as ReturnType<typeof vi.fn>

const validDates = { startDate: '2026-01-01', endDate: '2026-05-01' }

const tx = (over: Record<string, unknown>) => ({
  id: 't',
  type: 'despesa',
  amount: 0,
  description: 'X',
  date: '2026-01-10',
  status: 'concluida',
  category: null,
  ...over,
})

const reportJson = JSON.stringify({
  resumo: 'ok',
  destaques: [],
  categorias_principais: [],
  alertas: [],
  recomendacoes: [],
})

function clientWith(
  txData: unknown[],
  aiReportsResult: QueryResult = { data: { id: 'r1', created_at: '2026-05-28T00:00:00Z' }, error: null }
) {
  return createSupabaseMock({
    results: {
      transactions: { data: txData, error: null },
      ai_reports: aiReportsResult,
    },
  }).client
}

beforeEach(() => {
  vi.stubEnv('OPENROUTER_API_KEY', 'test-key')
  vi.stubGlobal('fetch', vi.fn())
  createClientMock.mockReset()
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('POST /api/ai-report', () => {
  it('returns 500 when the API key is missing', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', '')
    const res = await POST(jsonRequest(validDates))
    expect(res.status).toBe(500)
  })

  it('returns 400 for an invalid JSON body', async () => {
    const res = await POST({
      json: async () => {
        throw new Error('bad')
      },
    } as unknown as NextRequest)
    expect(res.status).toBe(400)
  })

  it('returns 400 for malformed dates', async () => {
    const res = await POST(jsonRequest({ startDate: 'x', endDate: '2026-05-01' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when startDate is after endDate', async () => {
    const res = await POST(jsonRequest({ startDate: '2026-05-02', endDate: '2026-05-01' }))
    expect(res.status).toBe(400)
  })

  it('returns 401 when the user is not authenticated', async () => {
    const { client } = createSupabaseMock({ user: null })
    createClientMock.mockResolvedValue(client)
    const res = await POST(jsonRequest(validDates))
    expect(res.status).toBe(401)
  })

  it('returns 500 when the transactions query fails', async () => {
    const { client } = createSupabaseMock({
      results: { transactions: { data: null, error: { message: 'boom' } } },
    })
    createClientMock.mockResolvedValue(client)
    const res = await POST(jsonRequest(validDates))
    expect(res.status).toBe(500)
  })

  it('returns 404 when there are no completed transactions', async () => {
    createClientMock.mockResolvedValue(clientWith([]))
    const res = await POST(jsonRequest(validDates))
    expect(res.status).toBe(404)
  })

  it('aggregates totals and returns a summary', async () => {
    const data = [
      tx({ id: '1', type: 'receita', amount: 1000, category: { name: 'Salário', type: 'receita' } }),
      tx({ id: '2', type: 'despesa', amount: 300, category: { name: 'Casa', type: 'despesa' } }),
      tx({ id: '3', type: 'despesa', amount: 200 }),
      tx({ id: '4', type: 'investimento', amount: 100 }),
    ]
    createClientMock.mockResolvedValue(clientWith(data))
    fetchMock().mockResolvedValue(okCompletion(reportJson))

    const res = await POST(jsonRequest({ ...validDates, periodLabel: 'Jan–Mai' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.summary).toMatchObject({
      income: 1000,
      expenses: 500,
      investments: 100,
      balance: 400,
      savingsRate: 50,
      transactionCount: 4,
      period: { start: '2026-01-01', end: '2026-05-01', label: 'Jan–Mai' },
    })
    expect(body.id).toBe('r1')
    expect(body.report.resumo).toBe('ok')
  })

  it('reports a null savings rate when there is no income', async () => {
    createClientMock.mockResolvedValue(clientWith([tx({ id: '1', type: 'despesa', amount: 250 })]))
    fetchMock().mockResolvedValue(okCompletion(reportJson))
    const res = await POST(jsonRequest(validDates))
    const body = await res.json()
    expect(body.summary.savingsRate).toBeNull()
    expect(body.summary.balance).toBe(-250)
  })

  it('still returns 200 when saving the report fails', async () => {
    createClientMock.mockResolvedValue(
      clientWith([tx({ id: '1', type: 'receita', amount: 500 })], { data: null, error: { message: 'save failed' } })
    )
    fetchMock().mockResolvedValue(okCompletion(reportJson))
    const res = await POST(jsonRequest(validDates))
    expect(res.status).toBe(200)
    expect((await res.json()).id).toBeNull()
  })

  it('returns 502 when OpenRouter responds with an error status', async () => {
    createClientMock.mockResolvedValue(clientWith([tx({ id: '1', type: 'receita', amount: 500 })]))
    fetchMock().mockResolvedValue(errorResponse(503))
    const res = await POST(jsonRequest(validDates))
    expect(res.status).toBe(502)
  })

  it('returns 502 when the AI returns invalid JSON', async () => {
    createClientMock.mockResolvedValue(clientWith([tx({ id: '1', type: 'receita', amount: 500 })]))
    fetchMock().mockResolvedValue(okCompletion('not json'))
    const res = await POST(jsonRequest(validDates))
    expect(res.status).toBe(502)
    expect((await res.json()).error).toMatch(/formato inesperado/)
  })

  it('returns 504 when the request is aborted', async () => {
    createClientMock.mockResolvedValue(clientWith([tx({ id: '1', type: 'receita', amount: 500 })]))
    const abortErr = new Error('aborted')
    abortErr.name = 'AbortError'
    fetchMock().mockRejectedValue(abortErr)
    const res = await POST(jsonRequest(validDates))
    expect(res.status).toBe(504)
  })
})
