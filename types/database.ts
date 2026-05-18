export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'receita' | 'despesa' | 'investimento' | 'transferencia'
          icon: string | null
          color: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'receita' | 'despesa' | 'investimento' | 'transferencia'
          icon?: string | null
          color?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'receita' | 'despesa' | 'investimento' | 'transferencia'
          icon?: string | null
          color?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          type: 'receita' | 'despesa' | 'transferencia' | 'investimento'
          amount: number
          description: string
          notes: string | null
          date: string
          status: 'pendente' | 'concluida' | 'cancelada'
          is_recurring: boolean
          recurring_frequency: string | null
          tags: string[] | null
          external_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          type: 'receita' | 'despesa' | 'transferencia' | 'investimento'
          amount: number
          description: string
          notes?: string | null
          date: string
          status?: 'pendente' | 'concluida' | 'cancelada'
          is_recurring?: boolean
          recurring_frequency?: string | null
          tags?: string[] | null
          external_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          type?: 'receita' | 'despesa' | 'transferencia' | 'investimento'
          amount?: number
          description?: string
          notes?: string | null
          date?: string
          status?: 'pendente' | 'concluida' | 'cancelada'
          is_recurring?: boolean
          recurring_frequency?: string | null
          tags?: string[] | null
          external_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          amount: number
          period: string
          start_date: string
          end_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          amount: number
          period: string
          start_date: string
          end_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          amount?: number
          period?: string
          start_date?: string
          end_date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
