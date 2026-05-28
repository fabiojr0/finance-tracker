import { describe, it, expect } from 'vitest'
import {
  transactionSchema,
  importedTransactionSchema,
  categorySchema,
  profileSchema,
  loginSchema,
  fullNameSchema,
  signupSchema,
} from '@/lib/utils/validation'

const firstMessage = (result: { success: boolean; error?: { issues: { message: string; path: PropertyKey[] }[] } }) =>
  result.success ? null : result.error!.issues[0].message

describe('transactionSchema', () => {
  const valid = {
    type: 'despesa',
    amount: 99.9,
    description: 'Mercado',
    date: '2026-05-28',
  }

  it('accepts a minimal valid transaction', () => {
    expect(transactionSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts all optional fields', () => {
    const result = transactionSchema.safeParse({
      ...valid,
      category_id: 'cat-1',
      notes: 'obs',
      status: 'concluida',
      is_recurring: true,
      recurring_frequency: 'mensal',
      tags: ['a', 'b'],
    })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid type', () => {
    expect(transactionSchema.safeParse({ ...valid, type: 'foo' }).success).toBe(false)
  })

  it('rejects a non-positive amount', () => {
    const result = transactionSchema.safeParse({ ...valid, amount: 0 })
    expect(result.success).toBe(false)
    expect(firstMessage(result)).toBe('Valor deve ser positivo')
  })

  it('rejects a non-numeric amount', () => {
    expect(transactionSchema.safeParse({ ...valid, amount: 'abc' }).success).toBe(false)
  })

  it('rejects a description shorter than 3 chars', () => {
    const result = transactionSchema.safeParse({ ...valid, description: 'ab' })
    expect(result.success).toBe(false)
    expect(firstMessage(result)).toBe('Descrição deve ter no mínimo 3 caracteres')
  })

  it('rejects a description longer than 255 chars', () => {
    const result = transactionSchema.safeParse({ ...valid, description: 'x'.repeat(256) })
    expect(result.success).toBe(false)
    expect(firstMessage(result)).toBe('Descrição deve ter no máximo 255 caracteres')
  })

  it('rejects an empty date', () => {
    const result = transactionSchema.safeParse({ ...valid, date: '' })
    expect(result.success).toBe(false)
    expect(firstMessage(result)).toBe('Data é obrigatória')
  })
})

describe('importedTransactionSchema', () => {
  const valid = {
    type: 'receita',
    amount: 1500,
    description: 'Salário',
    date: '2026-05-01',
  }

  it('accepts a valid imported transaction', () => {
    expect(importedTransactionSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts nullable category_id and external_id', () => {
    const result = importedTransactionSchema.safeParse({
      ...valid,
      category_id: null,
      external_id: null,
    })
    expect(result.success).toBe(true)
  })

  it('rejects a date not in YYYY-MM-DD format', () => {
    expect(importedTransactionSchema.safeParse({ ...valid, date: '01/05/2026' }).success).toBe(false)
    expect(importedTransactionSchema.safeParse({ ...valid, date: '2026-5-1' }).success).toBe(false)
  })

  it('rejects a negative amount', () => {
    expect(importedTransactionSchema.safeParse({ ...valid, amount: -10 }).success).toBe(false)
  })

  it('rejects an empty description', () => {
    expect(importedTransactionSchema.safeParse({ ...valid, description: '' }).success).toBe(false)
  })
})

describe('categorySchema', () => {
  it('accepts a valid category', () => {
    expect(categorySchema.safeParse({ name: 'Mercado', type: 'despesa' }).success).toBe(true)
  })

  it('rejects a name shorter than 2 chars', () => {
    const result = categorySchema.safeParse({ name: 'A', type: 'despesa' })
    expect(result.success).toBe(false)
    expect(firstMessage(result)).toBe('Nome deve ter no mínimo 2 caracteres')
  })

  it('rejects an invalid type', () => {
    expect(categorySchema.safeParse({ name: 'Mercado', type: 'foo' }).success).toBe(false)
  })
})

describe('profileSchema', () => {
  it('accepts an empty object (all optional)', () => {
    expect(profileSchema.safeParse({}).success).toBe(true)
  })

  it('rejects a full_name shorter than 2 chars', () => {
    expect(profileSchema.safeParse({ full_name: 'A' }).success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    expect(loginSchema.safeParse({ email: 'user@example.com', password: '123456' }).success).toBe(true)
  })

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({ email: 'invalid', password: '123456' })
    expect(result.success).toBe(false)
    expect(firstMessage(result)).toBe('Email inválido')
  })

  it('rejects a password shorter than 6 chars', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '123' })
    expect(result.success).toBe(false)
    expect(firstMessage(result)).toBe('Senha deve ter no mínimo 6 caracteres')
  })
})

describe('fullNameSchema', () => {
  it('accepts a first and last name', () => {
    expect(fullNameSchema.safeParse('João Silva').success).toBe(true)
  })

  it('accepts accented names', () => {
    expect(fullNameSchema.safeParse('José da Conceição').success).toBe(true)
  })

  it('rejects a single name', () => {
    const result = fullNameSchema.safeParse('João')
    expect(result.success).toBe(false)
    expect(firstMessage(result)).toBe('Informe nome e sobrenome')
  })

  it('rejects names containing digits', () => {
    const result = fullNameSchema.safeParse('João123 Silva')
    expect(result.success).toBe(false)
    expect(firstMessage(result)).toBe('Nome deve conter apenas letras e espaços')
  })

  it('rejects a name that is too short after trimming', () => {
    const result = fullNameSchema.safeParse(' A ')
    expect(result.success).toBe(false)
    expect(firstMessage(result)).toBe('Nome deve ter no mínimo 2 caracteres')
  })
})

describe('signupSchema', () => {
  const valid = {
    full_name: 'João Silva',
    email: 'joao@example.com',
    password: '123456',
    confirmPassword: '123456',
  }

  it('accepts a valid signup payload', () => {
    expect(signupSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects mismatched passwords on confirmPassword path', () => {
    const result = signupSchema.safeParse({ ...valid, confirmPassword: 'different' })
    expect(result.success).toBe(false)
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('confirmPassword'))
      expect(issue?.message).toBe('As senhas não coincidem')
    }
  })

  it('rejects an invalid full name', () => {
    expect(signupSchema.safeParse({ ...valid, full_name: 'João' }).success).toBe(false)
  })
})
