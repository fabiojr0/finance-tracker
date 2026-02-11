import { Database } from './database'

export type CategoryType = 'receita' | 'despesa' | 'investimento' | 'transferencia'

export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export interface CreateCategoryInput {
  name: string
  type: CategoryType
  icon?: string
  color?: string
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string
  is_active?: boolean
}
