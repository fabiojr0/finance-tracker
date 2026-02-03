'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { IconPicker } from '@/components/shared/icon-picker'
import { CategoryIcon } from '@/components/shared/category-icon'
import { useFinance } from '@/lib/contexts/finance-context'
import { CreateCategoryInput, CategoryType } from '@/types/category'

export default function CategoriesPage() {
  const { categories, categoriesLoading: loading, createCategory, deleteCategory } =
    useFinance()
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState<CreateCategoryInput>({
    name: '',
    type: 'despesa',
    icon: 'wallet',
    color: '#f97316',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const { error } = await createCategory(formData)
    setIsSubmitting(false)

    if (!error) {
      setShowForm(false)
      setFormData({
        name: '',
        type: 'despesa',
        icon: 'wallet',
        color: '#f97316',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      await deleteCategory(id)
    }
  }

  const incomeCategories = categories.filter((c) => c.type === 'receita')
  const expenseCategories = categories.filter((c) => c.type === 'despesa')
  const investmentCategories = categories.filter((c) => c.type === 'investimento')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold text-neutral-200">Categorias</h1>
          <p className="text-neutral-400 text-xs sm:text-base mt-0.5 sm:mt-1">
            Organize suas transações por categoria
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm" className="sm:h-10">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Nova Categoria</span>
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Nova Categoria</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Alimentação"
                    required
                    disabled={isSubmitting}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="type" className="text-sm">Tipo</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as CategoryType,
                      })
                    }
                    className="flex h-10 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary mt-1.5"
                    disabled={isSubmitting}
                  >
                    <option value="despesa">Despesa</option>
                    <option value="receita">Receita</option>
                    <option value="investimento">Investimento</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Ícone</Label>
                  <div className="mt-1.5">
                    <IconPicker
                      value={formData.icon}
                      onChange={(icon) => setFormData({ ...formData, icon })}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="color" className="text-sm">Cor</Label>
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    disabled={isSubmitting}
                    className="mt-1.5 h-10"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 sm:pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={isSubmitting}
                  size="sm"
                  className="sm:h-10"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} size="sm" className="sm:h-10">
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Expense Categories */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-red-500 text-base sm:text-lg">
              Categorias de Despesa
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            {expenseCategories.length === 0 ? (
              <EmptyState
                title="Nenhuma categoria de despesa"
                description="Adicione categorias para organizar suas despesas."
              />
            ) : (
              <div className="space-y-2">
                {expenseCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg border border-neutral-800 hover:bg-neutral-800 transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <CategoryIcon icon={category.icon} size="lg" />
                      <span className="font-medium text-sm sm:text-base truncate">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div
                        className="w-4 h-4 rounded-full border border-neutral-700"
                        style={{ backgroundColor: category.color || '#f97316' }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Income Categories */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-green-500 text-base sm:text-lg">
              Categorias de Receita
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            {incomeCategories.length === 0 ? (
              <EmptyState
                title="Nenhuma categoria de receita"
                description="Adicione categorias para organizar suas receitas."
              />
            ) : (
              <div className="space-y-2">
                {incomeCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg border border-neutral-800 hover:bg-neutral-800 transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <CategoryIcon icon={category.icon} size="lg" />
                      <span className="font-medium text-sm sm:text-base truncate">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div
                        className="w-4 h-4 rounded-full border border-neutral-700"
                        style={{ backgroundColor: category.color || '#22c55e' }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Investment Categories */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-blue-500 text-base sm:text-lg">
              Categorias de Investimento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            {investmentCategories.length === 0 ? (
              <EmptyState
                title="Nenhuma categoria de investimento"
                description="Adicione categorias para organizar seus investimentos."
              />
            ) : (
              <div className="space-y-2">
                {investmentCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg border border-neutral-800 hover:bg-neutral-800 transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <CategoryIcon icon={category.icon} size="lg" />
                      <span className="font-medium text-sm sm:text-base truncate">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div
                        className="w-4 h-4 rounded-full border border-neutral-700"
                        style={{ backgroundColor: category.color || '#3b82f6' }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
