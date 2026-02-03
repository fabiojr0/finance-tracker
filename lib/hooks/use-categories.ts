'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Category, CreateCategoryInput } from '@/types/category'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('type')
        .order('name')

      if (error) throw error

      setCategories(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError('Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async (input: CreateCategoryInput) => {
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

      setCategories([...categories, data])
      return { data, error: null }
    } catch (err) {
      console.error('Error creating category:', err)
      return { data: null, error: 'Erro ao criar categoria' }
    }
  }

  const updateCategory = async (
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

      setCategories(categories.map((c) => (c.id === id ? data : c)))
      return { data, error: null }
    } catch (err) {
      console.error('Error updating category:', err)
      return { data: null, error: 'Erro ao atualizar categoria' }
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      // Soft delete - just mark as inactive
      const { error } = await supabase
        .from('categories')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error

      setCategories(categories.filter((c) => c.id !== id))
      return { error: null }
    } catch (err) {
      console.error('Error deleting category:', err)
      return { error: 'Erro ao excluir categoria' }
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
  }
}
