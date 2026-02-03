'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  TransactionWithCategory,
  CreateTransactionInput,
} from '@/types/transaction'
import { Category, CreateCategoryInput } from '@/types/category'

interface FinanceContextType {
  // Transactions
  transactions: TransactionWithCategory[]
  transactionsLoading: boolean
  transactionsError: string | null
  createTransaction: (input: CreateTransactionInput) => Promise<{ data: TransactionWithCategory | null; error: string | null }>
  updateTransaction: (id: string, input: Partial<CreateTransactionInput>) => Promise<{ data: TransactionWithCategory | null; error: string | null }>
  deleteTransaction: (id: string) => Promise<{ error: string | null }>
  refetchTransactions: () => Promise<void>

  // Categories
  categories: Category[]
  categoriesLoading: boolean
  categoriesError: string | null
  createCategory: (input: CreateCategoryInput) => Promise<{ data: Category | null; error: string | null }>
  updateCategory: (id: string, input: Partial<CreateCategoryInput>) => Promise<{ data: Category | null; error: string | null }>
  deleteCategory: (id: string) => Promise<{ error: string | null }>
  refetchCategories: () => Promise<void>
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [transactionsError, setTransactionsError] = useState<string | null>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  const supabase = createClient()

  // Transactions functions
  const fetchTransactions = useCallback(async () => {
    try {
      setTransactionsLoading(true)
      const { data, error } = await supabase
        .from('transactions')
        .select(
          `
          *,
          category:categories(id, name, type, icon, color)
        `
        )
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(200)

      if (error) throw error

      setTransactions((data as TransactionWithCategory[]) || [])
      setTransactionsError(null)
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setTransactionsError('Erro ao carregar transações')
    } finally {
      setTransactionsLoading(false)
    }
  }, [supabase])

  const createTransaction = useCallback(async (input: CreateTransactionInput) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...input,
          user_id: user.id,
        })
        .select(
          `
          *,
          category:categories(id, name, type, icon, color)
        `
        )
        .single()

      if (error) throw error

      setTransactions((prev) => [data as TransactionWithCategory, ...prev])
      return { data, error: null }
    } catch (err) {
      console.error('Error creating transaction:', err)
      return { data: null, error: 'Erro ao criar transação' }
    }
  }, [supabase])

  const updateTransaction = useCallback(async (
    id: string,
    input: Partial<CreateTransactionInput>
  ) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(input)
        .eq('id', id)
        .select(
          `
          *,
          category:categories(id, name, type, icon, color)
        `
        )
        .single()

      if (error) throw error

      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? (data as TransactionWithCategory) : t))
      )
      return { data, error: null }
    } catch (err) {
      console.error('Error updating transaction:', err)
      return { data: null, error: 'Erro ao atualizar transação' }
    }
  }, [supabase])

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id)

      if (error) throw error

      setTransactions((prev) => prev.filter((t) => t.id !== id))
      return { error: null }
    } catch (err) {
      console.error('Error deleting transaction:', err)
      return { error: 'Erro ao excluir transação' }
    }
  }, [supabase])

  // Categories functions
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('type', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error

      setCategories((data as Category[]) || [])
      setCategoriesError(null)
    } catch (err) {
      console.error('Error fetching categories:', err)
      setCategoriesError('Erro ao carregar categorias')
    } finally {
      setCategoriesLoading(false)
    }
  }, [supabase])

  const createCategory = useCallback(async (input: CreateCategoryInput) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...input,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      setCategories((prev) => [...prev, data as Category])
      return { data, error: null }
    } catch (err) {
      console.error('Error creating category:', err)
      return { data: null, error: 'Erro ao criar categoria' }
    }
  }, [supabase])

  const updateCategory = useCallback(async (
    id: string,
    input: Partial<CreateCategoryInput>
  ) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(input)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setCategories((prev) =>
        prev.map((c) => (c.id === id ? (data as Category) : c))
      )
      return { data, error: null }
    } catch (err) {
      console.error('Error updating category:', err)
      return { data: null, error: 'Erro ao atualizar categoria' }
    }
  }, [supabase])

  const deleteCategory = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id)

      if (error) throw error

      setCategories((prev) => prev.filter((c) => c.id !== id))
      return { error: null }
    } catch (err) {
      console.error('Error deleting category:', err)
      return { error: 'Erro ao excluir categoria' }
    }
  }, [supabase])

  // Load data on mount
  useEffect(() => {
    fetchTransactions()
    fetchCategories()
  }, [fetchTransactions, fetchCategories])

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        transactionsLoading,
        transactionsError,
        createTransaction,
        updateTransaction,
        deleteTransaction,
        refetchTransactions: fetchTransactions,
        categories,
        categoriesLoading,
        categoriesError,
        createCategory,
        updateCategory,
        deleteCategory,
        refetchCategories: fetchCategories,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider')
  }
  return context
}
