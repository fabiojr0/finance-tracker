// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createSupabaseMock, type QueryResult } from './helpers/supabase'

const { clientHolder } = vi.hoisted(() => ({
  clientHolder: { current: null as ReturnType<typeof createSupabaseMock>['client'] | null },
}))
vi.mock('@/lib/supabase/client', () => ({ createClient: () => clientHolder.current }))

import { FinanceProvider, useFinance } from '@/lib/contexts/finance-context'

const wrapper = ({ children }: { children: ReactNode }) => (
  <FinanceProvider>{children}</FinanceProvider>
)

async function renderFinance(
  results: Record<string, QueryResult> = {},
  user: { id: string } | null = { id: 'user-1' }
) {
  const mock = createSupabaseMock({ results, user })
  clientHolder.current = mock.client
  const view = renderHook(() => useFinance(), { wrapper })
  await waitFor(() => {
    expect(view.result.current.transactionsLoading).toBe(false)
    expect(view.result.current.categoriesLoading).toBe(false)
  })
  return { ...view, state: mock.state }
}

const txRow = (over: Record<string, unknown> = {}) => ({
  id: 't1',
  type: 'despesa',
  amount: 50,
  description: 'Mercado',
  date: '2026-05-01',
  status: 'concluida',
  category: { id: 'c1', name: 'Casa', type: 'despesa', icon: null, color: null },
  ...over,
})

const catRow = (over: Record<string, unknown> = {}) => ({
  id: 'c1',
  name: 'Casa',
  type: 'despesa',
  icon: '🏠',
  color: '#fff',
  is_active: true,
  ...over,
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('FinanceProvider — initial load', () => {
  it('loads transactions and categories on mount', async () => {
    const { result } = await renderFinance({
      transactions: { data: [txRow()], error: null },
      categories: { data: [catRow()], error: null },
    })
    expect(result.current.transactions).toHaveLength(1)
    expect(result.current.categories).toHaveLength(1)
    expect(result.current.transactionsError).toBeNull()
    expect(result.current.categoriesError).toBeNull()
  })

  it('sets an error when the transactions fetch fails', async () => {
    const { result } = await renderFinance({
      transactions: { data: null, error: { message: 'boom' } },
      categories: { data: [], error: null },
    })
    expect(result.current.transactionsError).toBe('Erro ao carregar transações')
    expect(result.current.transactions).toEqual([])
  })

  it('sets an error when the categories fetch fails', async () => {
    const { result } = await renderFinance({
      transactions: { data: [], error: null },
      categories: { data: null, error: { message: 'boom' } },
    })
    expect(result.current.categoriesError).toBe('Erro ao carregar categorias')
  })
})

describe('createTransaction', () => {
  it('prepends the created transaction and returns it', async () => {
    const { result, state } = await renderFinance({
      transactions: { data: [], error: null },
      categories: { data: [], error: null },
    })
    const created = txRow({ id: 'new', description: 'Novo' })
    state.results.transactions = { data: created, error: null }

    let res!: Awaited<ReturnType<typeof result.current.createTransaction>>
    await act(async () => {
      res = await result.current.createTransaction({ type: 'despesa', amount: 10, description: 'Novo', date: '2026-05-02' })
    })
    expect(res.error).toBeNull()
    expect(res.data).toMatchObject({ id: 'new' })
    expect(result.current.transactions[0]).toMatchObject({ id: 'new' })
  })

  it('returns an error when the user is not authenticated', async () => {
    const { result } = await renderFinance(
      { transactions: { data: [], error: null }, categories: { data: [], error: null } },
      null
    )
    let res!: Awaited<ReturnType<typeof result.current.createTransaction>>
    await act(async () => {
      res = await result.current.createTransaction({ type: 'despesa', amount: 10, description: 'X', date: '2026-05-02' })
    })
    expect(res.data).toBeNull()
    expect(res.error).toBe('Erro ao criar transação')
  })

  it('returns an error when the insert fails', async () => {
    const { result, state } = await renderFinance({
      transactions: { data: [], error: null },
      categories: { data: [], error: null },
    })
    state.results.transactions = { data: null, error: { message: 'insert failed' } }
    let res!: Awaited<ReturnType<typeof result.current.createTransaction>>
    await act(async () => {
      res = await result.current.createTransaction({ type: 'despesa', amount: 10, description: 'X', date: '2026-05-02' })
    })
    expect(res.error).toBe('Erro ao criar transação')
  })
})

describe('bulkCreateTransactions', () => {
  it('prepends all created rows', async () => {
    const { result, state } = await renderFinance({
      transactions: { data: [], error: null },
      categories: { data: [], error: null },
    })
    state.results.transactions = { data: [txRow({ id: 'a' }), txRow({ id: 'b' })], error: null }
    let res!: Awaited<ReturnType<typeof result.current.bulkCreateTransactions>>
    await act(async () => {
      res = await result.current.bulkCreateTransactions([
        { type: 'despesa', amount: 1, description: 'A', date: '2026-05-01' },
        { type: 'despesa', amount: 2, description: 'B', date: '2026-05-02' },
      ])
    })
    expect(res.data).toHaveLength(2)
    expect(result.current.transactions).toHaveLength(2)
  })
})

describe('updateTransaction', () => {
  it('replaces the updated transaction in state', async () => {
    const { result, state } = await renderFinance({
      transactions: { data: [txRow({ id: 't1', description: 'Antigo' })], error: null },
      categories: { data: [], error: null },
    })
    state.results.transactions = { data: txRow({ id: 't1', description: 'Atualizado' }), error: null }
    await act(async () => {
      await result.current.updateTransaction('t1', { description: 'Atualizado' })
    })
    expect(result.current.transactions[0].description).toBe('Atualizado')
  })
})

describe('deleteTransaction', () => {
  it('removes the transaction from state', async () => {
    const { result } = await renderFinance({
      transactions: { data: [txRow({ id: 't1' }), txRow({ id: 't2' })], error: null },
      categories: { data: [], error: null },
    })
    await act(async () => {
      await result.current.deleteTransaction('t1')
    })
    expect(result.current.transactions.map((t) => t.id)).toEqual(['t2'])
  })
})

describe('deleteSeries', () => {
  it('removes all transactions in the series and reports the count', async () => {
    const { result, state } = await renderFinance({
      transactions: {
        data: [txRow({ id: 't1' }), txRow({ id: 't2' }), txRow({ id: 't3' })],
        error: null,
      },
      categories: { data: [], error: null },
    })
    state.results.transactions = { data: [{ id: 't1' }, { id: 't2' }], error: null }
    let res!: Awaited<ReturnType<typeof result.current.deleteSeries>>
    await act(async () => {
      res = await result.current.deleteSeries('series-1')
    })
    expect(res.count).toBe(2)
    expect(result.current.transactions.map((t) => t.id)).toEqual(['t3'])
  })
})

describe('category CRUD', () => {
  it('appends a created category', async () => {
    const { result, state } = await renderFinance({
      transactions: { data: [], error: null },
      categories: { data: [], error: null },
    })
    state.results.categories = { data: catRow({ id: 'cnew', name: 'Lazer' }), error: null }
    await act(async () => {
      await result.current.createCategory({ name: 'Lazer', type: 'despesa' })
    })
    expect(result.current.categories).toHaveLength(1)
    expect(result.current.categories[0]).toMatchObject({ id: 'cnew' })
  })

  it('updates a category in place', async () => {
    const { result, state } = await renderFinance({
      transactions: { data: [], error: null },
      categories: { data: [catRow({ id: 'c1', name: 'Casa' })], error: null },
    })
    state.results.categories = { data: catRow({ id: 'c1', name: 'Moradia' }), error: null }
    await act(async () => {
      await result.current.updateCategory('c1', { name: 'Moradia' })
    })
    expect(result.current.categories[0].name).toBe('Moradia')
  })

  it('removes a deleted category', async () => {
    const { result } = await renderFinance({
      transactions: { data: [], error: null },
      categories: { data: [catRow({ id: 'c1' }), catRow({ id: 'c2' })], error: null },
    })
    await act(async () => {
      await result.current.deleteCategory('c1')
    })
    expect(result.current.categories.map((c) => c.id)).toEqual(['c2'])
  })
})

describe('useFinance', () => {
  it('throws when used outside the provider', () => {
    expect(() => renderHook(() => useFinance())).toThrow(/within a FinanceProvider/)
  })
})
