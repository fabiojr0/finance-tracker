import { vi } from 'vitest'

export interface QueryResult {
  data: unknown
  error: unknown
}

const CHAIN_METHODS = [
  'select',
  'order',
  'limit',
  'eq',
  'in',
  'gte',
  'lte',
  'insert',
  'update',
  'delete',
  'single',
] as const

/**
 * Builds a fake Supabase client whose query builder is both chainable and
 * awaitable. Each `from(table)` chain resolves to `state.results[table]`,
 * read lazily at await-time so tests can update results between steps.
 */
export function createSupabaseMock(opts: {
  user?: { id: string } | null
  results?: Record<string, QueryResult>
} = {}) {
  const state = {
    user: opts.user === undefined ? { id: 'user-1' } : opts.user,
    results: opts.results ?? {},
  }

  const makeBuilder = (table: string) => {
    const builder: Record<string, unknown> = {}
    for (const m of CHAIN_METHODS) {
      builder[m] = vi.fn(() => builder)
    }
    builder.then = (resolve: (v: QueryResult) => unknown, reject?: (e: unknown) => unknown) =>
      Promise.resolve(state.results[table] ?? { data: null, error: null }).then(resolve, reject)
    return builder
  }

  const client = {
    auth: {
      getUser: vi.fn(async () => ({ data: { user: state.user } })),
    },
    from: vi.fn((table: string) => makeBuilder(table)),
  }

  return { client, state }
}

/** Fake `fetch` Response for a successful OpenRouter chat completion. */
export function okCompletion(content: string) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ choices: [{ message: { content } }] }),
    text: async () => content,
  }
}

/** Fake `fetch` Response for an error status. */
export function errorResponse(status: number, body = 'error') {
  return {
    ok: false,
    status,
    json: async () => ({}),
    text: async () => body,
  }
}
