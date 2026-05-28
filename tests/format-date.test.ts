import { describe, it, expect, afterEach, vi } from 'vitest'
import { formatDate, formatDateTime, formatRelative } from '@/lib/utils/format-date'

describe('formatDate', () => {
  it('formats an ISO date string with the default pattern', () => {
    expect(formatDate('2026-05-28')).toBe('28/05/2026')
  })

  it('formats a Date object', () => {
    expect(formatDate(new Date(2026, 4, 28))).toBe('28/05/2026')
  })

  it('accepts a custom pattern', () => {
    expect(formatDate('2026-05-28', 'yyyy')).toBe('2026')
    expect(formatDate('2026-01-09', 'dd/MM')).toBe('09/01')
  })

  it('returns an empty string for an invalid date', () => {
    expect(formatDate('not-a-date')).toBe('')
    expect(formatDate('')).toBe('')
  })
})

describe('formatDateTime', () => {
  it('formats date and time in pt-BR style', () => {
    expect(formatDateTime('2026-05-28T14:30:00')).toBe('28/05/2026 às 14:30')
  })
})

describe('formatRelative', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  const freezeNow = () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 4, 28, 12, 0, 0))
  }

  it('returns "Hoje" for the same day', () => {
    freezeNow()
    expect(formatRelative('2026-05-28')).toBe('Hoje')
  })

  it('returns "Ontem" for the previous day', () => {
    freezeNow()
    expect(formatRelative('2026-05-27')).toBe('Ontem')
  })

  it('returns "N dias atrás" within the last week', () => {
    freezeNow()
    expect(formatRelative('2026-05-25T12:00:00')).toBe('3 dias atrás')
  })

  it('falls back to a formatted date when older than a week', () => {
    freezeNow()
    expect(formatRelative('2026-05-01T12:00:00')).toBe('01/05/2026')
  })
})
