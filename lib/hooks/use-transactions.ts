'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Transaction,
  TransactionWithCategory,
  CreateTransactionInput,
} from '@/types/transaction'

export function useTransactions() {
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchTransactions = async () => {
    try {
      setLoading(true)
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
        .limit(100)

      if (error) throw error

      setTransactions((data as TransactionWithCategory[]) || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError('Erro ao carregar transações')
    } finally {
      setLoading(false)
    }
  }

  const createTransaction = async (input: CreateTransactionInput) => {
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

      setTransactions([data as TransactionWithCategory, ...transactions])
      return { data, error: null }
    } catch (err) {
      console.error('Error creating transaction:', err)
      return { data: null, error: 'Erro ao criar transação' }
    }
  }

  const updateTransaction = async (
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

      setTransactions(
        transactions.map((t) =>
          t.id === id ? (data as TransactionWithCategory) : t
        )
      )
      return { data, error: null }
    } catch (err) {
      console.error('Error updating transaction:', err)
      return { data: null, error: 'Erro ao atualizar transação' }
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id)

      if (error) throw error

      setTransactions(transactions.filter((t) => t.id !== id))
      return { error: null }
    } catch (err) {
      console.error('Error deleting transaction:', err)
      return { error: 'Erro ao excluir transação' }
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  return {
    transactions,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
  }
}
