import { z } from 'zod'

export const transactionSchema = z.object({
  type: z.enum(['receita', 'despesa', 'transferencia', 'investimento'], 'Tipo de transação é obrigatório'),
  amount: z
    .number({
      message: 'Valor deve ser um número',
    })
    .positive('Valor deve ser positivo'),
  description: z
    .string()
    .min(3, 'Descrição deve ter no mínimo 3 caracteres')
    .max(255, 'Descrição deve ter no máximo 255 caracteres'),
  date: z.string().min(1, 'Data é obrigatória'),
  category_id: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['pendente', 'concluida', 'cancelada']).optional(),
  is_recurring: z.boolean().optional(),
  recurring_frequency: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  type: z.enum(['receita', 'despesa', 'investimento'], 'Tipo de categoria é obrigatório'),
  icon: z.string().optional(),
  color: z.string().optional(),
})

export const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional(),
  currency: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export const signupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})
