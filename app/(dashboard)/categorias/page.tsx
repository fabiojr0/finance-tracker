'use client'

import { Plus, Trash2, Pencil, ArrowDownLeft, ArrowUpRight, LineChart, ArrowLeftRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton, SkeletonCategoryCard } from '@/components/shared/skeleton'
import { CategoryIcon } from '@/components/shared/category-icon'
import { useCategoryModal } from '@/components/categories/category-modal'
import { useFinance } from '@/lib/contexts/finance-context'
import { Category } from '@/types/category'

interface CategorySectionProps {
  title: string
  icon: React.ReactNode
  iconBg: string
  borderColor: string
  categories: Category[]
  defaultColor: string
  emptyTitle: string
  emptyDescription: string
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
}

function CategorySection({
  title,
  icon,
  iconBg,
  categories,
  defaultColor,
  emptyTitle,
  emptyDescription,
  onEdit,
  onDelete,
}: CategorySectionProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center gap-2.5">
          <div className={`rounded-lg p-1.5 ${iconBg}`}>
            {icon}
          </div>
          <div>
            <CardTitle className={`text-base sm:text-lg text-white`}>{title}</CardTitle>
            <p className="text-xs text-neutral-500 mt-0.5">{categories.length} categorias</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        {categories.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            className="py-6"
          />
        ) : (
          <div className="space-y-1.5">
            {categories.map((category) => (
              <div
                key={category.id}
                className="group/cat flex items-center justify-between p-2.5 sm:p-3 rounded-xl hover:bg-neutral-800/50 transition-all duration-200"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div
                    className="flex items-center justify-center h-9 w-9 rounded-lg transition-transform duration-200 group-hover/cat:scale-105"
                    style={{ backgroundColor: `${category.color || defaultColor}20` }}
                  >
                    <CategoryIcon icon={category.icon ?? null} size="lg" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium text-sm sm:text-base text-neutral-200 truncate block">{category.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-neutral-700/50 flex-shrink-0"
                    style={{ backgroundColor: category.color || defaultColor }}
                  />
                  <div className="flex items-center gap-0.5 opacity-0 group-hover/cat:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(category)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-3.5 w-3.5 text-neutral-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(category.id)}
                      className="h-8 w-8 p-0 hover:bg-red-500/15"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

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
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-5 w-56" />
          </div>
          <Skeleton className="h-9 w-9 sm:h-10 sm:w-36 rounded-md" />
        </div>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Categorias</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Organize suas transações por categoria ({categories.length} no total)
          </p>
        </div>
        <Button onClick={() => openModal()} size="sm" className="sm:h-10 gap-1.5">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova Categoria</span>
        </Button>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <CategorySection
          title="Despesas"
          icon={<ArrowUpRight className="h-4 w-4 text-red-400" />}
          iconBg="bg-red-500/15"
          borderColor="border-red-500/20"
          categories={expenseCategories}
          defaultColor="#ef4444"
          emptyTitle="Nenhuma categoria de despesa"
          emptyDescription="Adicione categorias para organizar suas despesas."
          onEdit={openEditModal}
          onDelete={handleDelete}
        />

        <CategorySection
          title="Receitas"
          icon={<ArrowDownLeft className="h-4 w-4 text-emerald-400" />}
          iconBg="bg-emerald-500/15"
          borderColor="border-emerald-500/20"
          categories={incomeCategories}
          defaultColor="#22c55e"
          emptyTitle="Nenhuma categoria de receita"
          emptyDescription="Adicione categorias para organizar suas receitas."
          onEdit={openEditModal}
          onDelete={handleDelete}
        />

        <CategorySection
          title="Investimentos"
          icon={<LineChart className="h-4 w-4 text-blue-400" />}
          iconBg="bg-blue-500/15"
          borderColor="border-blue-500/20"
          categories={investmentCategories}
          defaultColor="#3b82f6"
          emptyTitle="Nenhuma categoria de investimento"
          emptyDescription="Adicione categorias para organizar seus investimentos."
          onEdit={openEditModal}
          onDelete={handleDelete}
        />

        <CategorySection
          title="Transferências"
          icon={<ArrowLeftRight className="h-4 w-4 text-amber-400" />}
          iconBg="bg-amber-500/15"
          borderColor="border-amber-500/20"
          categories={transferCategories}
          defaultColor="#eab308"
          emptyTitle="Nenhuma categoria de transferência"
          emptyDescription="Adicione categorias para organizar suas transferências."
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}
