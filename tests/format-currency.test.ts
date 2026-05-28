import { describe, it, expect } from 'vitest'
import { formatCurrency, parseCurrencyInput } from '@/lib/utils/format-currency'

// Intl currency output uses a non-breaking space (U+00A0) between symbol and value.
const normalize = (s: string) => s.replace(/ /g, ' ')

describe('formatCurrency', () => {
  it('formats a positive value as BRL by default', () => {
    expect(normalize(formatCurrency(1234.5))).toBe('R$ 1.234,50')
  })

  it('formats zero', () => {
    expect(normalize(formatCurrency(0))).toBe('R$ 0,00')
  })

  it('formats negative values', () => {
    expect(normalize(formatCurrency(-50))).toBe('-R$ 50,00')
  })

  it('rounds to two decimal places', () => {
    expect(normalize(formatCurrency(9.999))).toBe('R$ 10,00')
  })

  it('groups thousands', () => {
    expect(normalize(formatCurrency(1000000))).toBe('R$ 1.000.000,00')
  })

  it('respects a different currency code', () => {
    expect(formatCurrency(10, 'USD')).toContain('10')
    expect(formatCurrency(10, 'USD')).toContain('$')
  })
})

describe('parseCurrencyInput', () => {
  it('parses a plain integer string', () => {
    expect(parseCurrencyInput('150')).toBe(150)
  })

  it('parses a value with comma as decimal separator', () => {
    expect(parseCurrencyInput('150,50')).toBe(150.5)
  })

  it('strips the currency symbol and spaces', () => {
    expect(parseCurrencyInput('R$ 1.234')).toBe(1.234)
  })

  it('handles dot decimals', () => {
    expect(parseCurrencyInput('99.90')).toBe(99.9)
  })

  it('returns 0 for empty or non-numeric input', () => {
    expect(parseCurrencyInput('')).toBe(0)
    expect(parseCurrencyInput('abc')).toBe(0)
  })

  it('parses negative values', () => {
    expect(parseCurrencyInput('-42')).toBe(-42)
  })
})
