import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { NextRequest } from 'next/server'
import { createSupabaseMock, okCompletion, errorResponse } from './helpers/supabase'

const { createClientMock } = vi.hoisted(() => ({ createClientMock: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({ createClient: createClientMock }))

import { POST } from '@/app/api/payment-suggestions/route'

const jsonRequest = (body: unknown): NextRequest =>
  ({ json: async () => body }) as unknown as NextRequest

const fetchMock = () => global.fetch as unknown as ReturnType<typeof vi.fn>

const validDates = { startDate: '2026-01-01', endDate: '2026-05-01' }

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

describe('POST /api/payment-suggestions', () => {
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
    const res = await POST(jsonRequest({ startDate: '01/01/2026', endDate: '2026-05-01' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/Datas inválidas/)
  })

  it('returns 400 when startDate is after endDate', async () => {
    const res = await POST(jsonRequest({ startDate: '2026-05-01', endDate: '2026-01-01' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/anterior/)
  })

  it('returns 401 when the user is not authenticated', async () => {
    const { client } = createSupabaseMock({ user: null })
    createClientMock.mockResolvedValue(client)
    const res = await POST(jsonRequest(validDates))
    expect(res.status).toBe(401)
  })

  it('returns 500 when the data query fails', async () => {
    const { client } = createSupabaseMock({
      results: {
        transactions: { data: null, error: { message: 'db down' } },
        categories: { data: [], error: null },
      },
    })
    createClientMock.mockResolvedValue(client)
    const res = await POST(jsonRequest(validDates))
    expect(res.status).toBe(500)
    expect((await res.json()).error).toBe('Erro ao carregar dados')
  })

  it('returns 404 when there are no completed transactions', async () => {
    const { client } = createSupabaseMock({
      results: {
        transactions: { data: [], error: null },
        categories: { data: [], error: null },
      },
    })
    createClientMock.mockResolvedValue(client)
    const res = await POST(jsonRequest(validDates))
    expect(res.status).toBe(404)
  })

  it('cleans and validates AI suggestions', async () => {
    const { client } = createSupabaseMock({
      results: {
        transactions: {
          data: [
            {
              id: 't1',
              type: 'despesa',
              amount: 100,
              description: 'Internet Vivo',
              date: '2026-01-10',
              status: 'concluida',
              category: { id: 'cat-1', name: 'Casa', type: 'despesa' },
            },
          ],
          error: null,
        },
        categories: { data: [{ id: 'cat-1', name: 'Casa', type: 'despesa' }], error: null },
      },
    })
    createClientMock.mockResolvedValue(client)

    const aiSuggestions = {
      suggestions: [
        { description: 'Internet', amount: 100, due_date: '2026-06-10', type: 'despesa', category_id: 'cat-1', recurrence: 'mensal', reason: 'todo mês' },
        { description: 'AmountZero', amount: 0, due_date: '2026-06-10', type: 'despesa', category_id: 'cat-1', recurrence: 'mensal', reason: 'x' },
        { description: 'BadDate', amount: 50, due_date: '06/2026', type: 'despesa', category_id: 'cat-1', recurrence: 'mensal', reason: 'x' },
        { description: 'BadType', amount: 50, due_date: '2026-06-10', type: 'receita', category_id: 'cat-1', recurrence: 'mensal', reason: 'x' },
        { description: 'UnknownCat', amount: 75, due_date: '2026-06-10', type: 'investimento', category_id: 'cat-999', recurrence: 'anual', reason: 'x' },
      ],
    }
    fetchMock().mockResolvedValue(okCompletion(JSON.stringify(aiSuggestions)))

    const res = await POST(jsonRequest(validDates))
    expect(res.status).toBe(200)
    const { suggestions } = await res.json()
    expect(suggestions).toHaveLength(2)
    expect(suggestions[0]).toMatchObject({ description: 'Internet', category_id: 'cat-1' })
    // category_id that isn't in the user's set is nulled out
    expect(suggestions[1]).toMatchObject({ description: 'UnknownCat', category_id: null })
  })

  it('returns 502 when OpenRouter responds with an error status', async () => {
    const { client } = createSupabaseMock({
      results: {
        transactions: {
          data: [{ id: 't1', type: 'despesa', amount: 100, description: 'X', date: '2026-01-10', status: 'concluida', category: null }],
          error: null,
        },
        categories: { data: [], error: null },
      },
    })
    createClientMock.mockResolvedValue(client)
    fetchMock().mockResolvedValue(errorResponse(500))
    const res = await POST(jsonRequest(validDates))
    expect(res.status).toBe(502)
  })

  it('returns 502 when the AI returns invalid JSON', async () => {
    const { client } = createSupabaseMock({
      results: {
        transactions: {
          data: [{ id: 't1', type: 'despesa', amount: 100, description: 'X', date: '2026-01-10', status: 'concluida', category: null }],
          error: null,
        },
        categories: { data: [], error: null },
      },
    })
    createClientMock.mockResolvedValue(client)
    fetchMock().mockResolvedValue(okCompletion('totally not json'))
    const res = await POST(jsonRequest(validDates))
    expect(res.status).toBe(502)
    expect((await res.json()).error).toMatch(/formato inesperado/)
  })

  it('returns 504 when the request is aborted', async () => {
    const { client } = createSupabaseMock({
      results: {
        transactions: {
          data: [{ id: 't1', type: 'despesa', amount: 100, description: 'X', date: '2026-01-10', status: 'concluida', category: null }],
          error: null,
        },
        categories: { data: [], error: null },
      },
    })
    createClientMock.mockResolvedValue(client)
    const abortErr = new Error('aborted')
    abortErr.name = 'AbortError'
    fetchMock().mockRejectedValue(abortErr)
    const res = await POST(jsonRequest(validDates))
    expect(res.status).toBe(504)
  })
})
