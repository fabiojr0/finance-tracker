import { Database } from './database'

export type TransactionType = 'receita' | 'despesa' | 'transferencia' | 'investimento'
export type TransactionStatus = 'pendente' | 'concluida' | 'cancelada'

export type Transaction = Database['public']['Tables']['transactions']['Row']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

export interface TransactionWithCategory extends Transaction {
  category?: {
    id: string
    name: string
    type: 'receita' | 'despesa' | 'investimento'
    icon: string | null
    color: string | null
  }
}

export interface CreateTransactionInput {
  category_id?: string
  type: TransactionType
  amount: number
  description: string
  notes?: string
  date: string
  status?: TransactionStatus
  is_recurring?: boolean
  recurring_frequency?: string
  tags?: string[]
}

export interface UpdateTransactionInput extends Partial<CreateTransactionInput> {
  id: string
}
