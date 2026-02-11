'use client'

import { Plus, Trash2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton, SkeletonCategoryCard } from '@/components/shared/skeleton'
import { CategoryIcon } from '@/components/shared/category-icon'
import { useCategoryModal } from '@/components/categories/category-modal'
import { useFinance } from '@/lib/contexts/finance-context'

export default function CategoriesPage() {
  const { categories, categoriesLoading: loading, deleteCategory } = useFinance()
  const { openModal, openEditModal } = useCategoryModal()

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      await deleteCategory(id)
    }
  }

  const incomeCategories = categories.filter((c) => c.type === 'receita')
  const expenseCategories = categories.filter((c) => c.type === 'despesa')
  const investmentCategories = categories.filter((c) => c.type === 'investimento')
  const transferCategories = categories.filter((c) => c.type === 'transferencia')

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-9 sm:h-10 sm:w-36 rounded-md" />
        </div>
        {/* Category Cards Skeleton */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <SkeletonCategoryCard />
          <SkeletonCategoryCard />
          <SkeletonCategoryCard />
          <SkeletonCategoryCard />
        </div>
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
        <Button onClick={() => openModal()} size="sm" className="sm:h-10">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Nova Categoria</span>
        </Button>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
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
                        onClick={() => openEditModal(category)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-3.5 w-3.5 text-neutral-400" />
                      </Button>
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
                        onClick={() => openEditModal(category)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-3.5 w-3.5 text-neutral-400" />
                      </Button>
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
                        onClick={() => openEditModal(category)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-3.5 w-3.5 text-neutral-400" />
                      </Button>
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

        {/* Transfer Categories */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-yellow-500 text-base sm:text-lg">
              Categorias de Transferência
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            {transferCategories.length === 0 ? (
              <EmptyState
                title="Nenhuma categoria de transferência"
                description="Adicione categorias para organizar suas transferências."
              />
            ) : (
              <div className="space-y-2">
                {transferCategories.map((category) => (
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
                        style={{ backgroundColor: category.color || '#eab308' }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(category)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-3.5 w-3.5 text-neutral-400" />
                      </Button>
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
