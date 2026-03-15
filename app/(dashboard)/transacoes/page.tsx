'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  Plus,
  Trash2,
  Pencil,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  LineChart,
  Receipt,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton, SkeletonTable } from '@/components/shared/skeleton'
import { CategoryIcon } from '@/components/shared/category-icon'
import { useTransactionModal } from '@/components/transactions/transaction-modal'
import {
  TransactionFilterModal,
  TransactionFilters,
  FilterTag,
} from '@/components/transactions/transaction-filter-modal'
import { PeriodSelector, getDateRange, PeriodKey } from '@/components/shared/period-selector'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { useFinance } from '@/lib/contexts/finance-context'
import { formatCurrency } from '@/lib/utils/format-currency'
import { formatDate } from '@/lib/utils/format-date'
import { cn } from '@/lib/utils/cn'

type SortField = 'date' | 'description' | 'category' | 'amount' | 'type' | 'status'
type SortDirection = 'asc' | 'desc' | null

export default function TransactionsPage() {
  const {
    transactions,
    categories,
    transactionsLoading: loading,
    deleteTransaction,
  } = useFinance()

  const { openModal, openEditModal } = useTransactionModal()

  // Filter modal
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  // Period selector
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('all')

  // Filters
  const [filters, setFilters] = useState<TransactionFilters>({
    typeFilter: 'all',
    categoryFilter: 'all',
    statusFilter: 'all',
    searchQuery: '',
    startDate: '',
    endDate: '',
  })

  const handlePeriodChange = useCallback((period: PeriodKey) => {
    setSelectedPeriod(period)
    const range = getDateRange(period)
    if (range) {
      const formatToDateStr = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      setFilters((prev) => ({
        ...prev,
        startDate: formatToDateStr(range.startDate),
        endDate: formatToDateStr(range.endDate),
      }))
    } else {
      setFilters((prev) => ({ ...prev, startDate: '', endDate: '' }))
    }
  }, [])

  // Sorting
  const [sortField, setSortField] = useState<SortField | null>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'desc') {
        setSortDirection('asc')
      } else if (sortDirection === 'asc') {
        setSortField(null)
        setSortDirection(null)
      }
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-500" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
    )
  }

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions]

    if (filters.typeFilter !== 'all') {
      result = result.filter((t) => t.type === filters.typeFilter)
    }
    if (filters.categoryFilter !== 'all') {
      result = result.filter((t) => t.category_id === filters.categoryFilter)
    }
    if (filters.statusFilter !== 'all') {
      result = result.filter((t) => t.status === filters.statusFilter)
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(query) ||
          t.category?.name?.toLowerCase().includes(query)
      )
    }
    if (filters.startDate) {
      const start = new Date(filters.startDate)
      start.setHours(0, 0, 0, 0)
      result = result.filter((t) => new Date(t.date) >= start)
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate)
      end.setHours(23, 59, 59, 999)
      result = result.filter((t) => new Date(t.date) <= end)
    }

    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let comparison = 0

        switch (sortField) {
          case 'date':
            comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
            break
          case 'description':
            comparison = a.description.localeCompare(b.description)
            break
          case 'category':
            comparison = (a.category?.name || '').localeCompare(b.category?.name || '')
            break
          case 'amount':
            comparison = Number(a.amount) - Number(b.amount)
            break
          case 'type':
            comparison = a.type.localeCompare(b.type)
            break
          case 'status':
            comparison = a.status.localeCompare(b.status)
            break
        }

        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    return result
  }, [transactions, filters, sortField, sortDirection])

  // Summary stats for the filtered transactions
  const summary = useMemo(() => {
    const completed = filteredAndSortedTransactions.filter(t => t.status === 'concluida')
    const income = completed.filter(t => t.type === 'receita').reduce((s, t) => s + Number(t.amount), 0)
    const expenses = completed.filter(t => t.type === 'despesa').reduce((s, t) => s + Number(t.amount), 0)
    return { income, expenses, balance: income - expenses }
  }, [filteredAndSortedTransactions])

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      await deleteTransaction(id)
    }
  }

  const clearFilters = () => {
    setSelectedPeriod('all')
    setFilters({
      typeFilter: 'all',
      categoryFilter: 'all',
      statusFilter: 'all',
      searchQuery: '',
      startDate: '',
      endDate: '',
    })
  }

  const hasActiveFilters =
    filters.typeFilter !== 'all' ||
    filters.categoryFilter !== 'all' ||
    filters.statusFilter !== 'all' ||
    filters.searchQuery !== '' ||
    filters.startDate !== '' ||
    filters.endDate !== ''

  const activeFilterCount = [
    filters.typeFilter !== 'all',
    filters.categoryFilter !== 'all',
    filters.statusFilter !== 'all',
    filters.startDate !== '' || filters.endDate !== '',
  ].filter(Boolean).length

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      receita: 'Receita',
      despesa: 'Despesa',
      investimento: 'Investimento',
      transferencia: 'Transferência',
    }
    return labels[type] || type
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      concluida: 'Concluída',
      pendente: 'Pendente',
      cancelada: 'Cancelada',
    }
    return labels[status] || status
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category?.name || categoryId
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'receita':
        return <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
      case 'despesa':
        return <ArrowUpRight className="h-4 w-4 text-red-400" />
      case 'investimento':
        return <LineChart className="h-4 w-4 text-blue-400" />
      case 'transferencia':
        return <ArrowLeftRight className="h-4 w-4 text-amber-400" />
      default:
        return null
    }
  }

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { bg: string; text: string; label: string }> = {
      receita: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Receita' },
      despesa: { bg: 'bg-red-500/15', text: 'text-red-400', label: 'Despesa' },
      investimento: { bg: 'bg-blue-500/15', text: 'text-blue-400', label: 'Investimento' },
      transferencia: { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'Transferência' },
    }
    const variant = variants[type] || variants.despesa
    return (
      <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap', variant.bg, variant.text)}>
        {variant.label}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string; label: string }> = {
      concluida: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Concluída' },
      pendente: { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'Pendente' },
      cancelada: { bg: 'bg-neutral-500/15', text: 'text-neutral-400', label: 'Cancelada' },
    }
    const variant = variants[status] || variants.pendente
    return (
      <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap', variant.bg, variant.text)}>
        {variant.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-9 w-9 sm:h-10 sm:w-36 rounded-md" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <SkeletonTable rows={8} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Transações</h1>
          <p className="text-neutral-400 text-sm mt-1">
            {filteredAndSortedTransactions.length} transações
            {hasActiveFilters && ` (filtrado de ${transactions.length})`}
          </p>
        </div>
        <Button onClick={openModal} size="sm" className="sm:h-10 gap-1.5">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova Transação</span>
        </Button>
      </div>

      {/* Summary mini cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs font-medium text-neutral-400">Receitas</p>
          <p className="text-sm sm:text-lg font-bold text-emerald-400 mt-0.5 truncate tabular-nums">
            {formatCurrency(summary.income)}
          </p>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs font-medium text-neutral-400">Despesas</p>
          <p className="text-sm sm:text-lg font-bold text-red-400 mt-0.5 truncate tabular-nums">
            {formatCurrency(summary.expenses)}
          </p>
        </div>
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs font-medium text-neutral-400">Saldo</p>
          <p className={cn(
            'text-sm sm:text-lg font-bold mt-0.5 truncate tabular-nums',
            summary.balance >= 0 ? 'text-emerald-400' : 'text-red-400'
          )}>
            {formatCurrency(summary.balance)}
          </p>
        </div>
      </div>

      {/* Period Selector */}
      <PeriodSelector selected={selectedPeriod} onChange={handlePeriodChange} showAll />

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex items-center justify-end gap-2">
          <Input
            placeholder="Buscar transações..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            className="w-full max-w-xs h-9"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterModalOpen(true)}
            className="h-9 gap-1.5"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filtrar</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Active filter tags */}
        {(filters.typeFilter !== 'all' ||
          filters.categoryFilter !== 'all' ||
          filters.statusFilter !== 'all' ||
          filters.startDate ||
          filters.endDate) && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {filters.typeFilter !== 'all' && (
              <FilterTag
                label={getTypeLabel(filters.typeFilter)}
                onRemove={() => setFilters({ ...filters, typeFilter: 'all' })}
              />
            )}
            {filters.categoryFilter !== 'all' && (
              <FilterTag
                label={getCategoryName(filters.categoryFilter)}
                onRemove={() => setFilters({ ...filters, categoryFilter: 'all' })}
              />
            )}
            {filters.statusFilter !== 'all' && (
              <FilterTag
                label={getStatusLabel(filters.statusFilter)}
                onRemove={() => setFilters({ ...filters, statusFilter: 'all' })}
              />
            )}
            {(filters.startDate || filters.endDate) && (
              <FilterTag
                label={
                  filters.startDate && filters.endDate
                    ? `${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`
                    : filters.startDate
                    ? `A partir de ${formatDate(filters.startDate)}`
                    : `Até ${formatDate(filters.endDate)}`
                }
                onRemove={() => setFilters({ ...filters, startDate: '', endDate: '' })}
              />
            )}

            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs text-neutral-400">
              Limpar filtros
            </Button>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <TransactionFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
        categories={categories}
      />

      {/* Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {filteredAndSortedTransactions.length === 0 ? (
            <div className="p-6 sm:p-8">
              <EmptyState
                title={hasActiveFilters ? 'Nenhuma transação encontrada' : 'Nenhuma transação ainda'}
                description={
                  hasActiveFilters
                    ? 'Tente ajustar os filtros para ver mais resultados.'
                    : 'Comece adicionando sua primeira transação para acompanhar suas finanças.'
                }
                icon={<Receipt className="h-12 w-12" />}
                action={
                  hasActiveFilters ? (
                    <Button variant="outline" onClick={clearFilters}>
                      Limpar Filtros
                    </Button>
                  ) : (
                    <Button onClick={openModal}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Transação
                    </Button>
                  )
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[60vh] sm:max-h-none overflow-y-auto sm:overflow-y-visible">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-neutral-800 bg-neutral-900/50">
                    <TableHead
                      className="cursor-pointer select-none min-w-[180px]"
                      onClick={() => handleSort('description')}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-xs sm:text-sm">Descrição</span>
                        {getSortIcon('description')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hidden md:table-cell"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-xs sm:text-sm">Categoria</span>
                        {getSortIcon('category')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-xs sm:text-sm">Data</span>
                        {getSortIcon('date')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hidden lg:table-cell"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-xs sm:text-sm">Tipo</span>
                        {getSortIcon('type')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hidden sm:table-cell"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-xs sm:text-sm">Status</span>
                        {getSortIcon('status')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none text-right"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                        <span className="text-xs sm:text-sm">Valor</span>
                        {getSortIcon('amount')}
                      </div>
                    </TableHead>
                    <TableHead className="w-10 sm:w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="group/row">
                      <TableCell className="py-2.5 sm:py-4">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div
                            className={cn(
                              'flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex-shrink-0 transition-transform duration-200 group-hover/row:scale-105',
                              transaction.type === 'receita'
                                ? 'bg-emerald-500/15'
                                : transaction.type === 'investimento'
                                ? 'bg-blue-500/15'
                                : transaction.type === 'transferencia'
                                ? 'bg-amber-500/15'
                                : 'bg-red-500/15'
                            )}
                          >
                            {getTypeIcon(transaction.type)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-neutral-200 text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-neutral-500 md:hidden flex items-center gap-1">
                              {transaction.category ? (
                                <>
                                  <CategoryIcon icon={transaction.category.icon} size="sm" />
                                  <span className="truncate">{transaction.category.name}</span>
                                </>
                              ) : (
                                'Sem categoria'
                              )}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {transaction.category ? (
                          <div className="flex items-center gap-2">
                            <CategoryIcon icon={transaction.category.icon} size="sm" />
                            <span className="text-neutral-300 text-sm">{transaction.category.name}</span>
                          </div>
                        ) : (
                          <span className="text-neutral-500">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-neutral-300 text-xs sm:text-sm whitespace-nowrap">
                        {formatDate(transaction.date)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{getTypeBadge(transaction.type)}</TableCell>
                      <TableCell className="hidden sm:table-cell">{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            'font-semibold text-sm sm:text-base whitespace-nowrap tabular-nums',
                            transaction.type === 'receita'
                              ? 'text-emerald-400'
                              : transaction.type === 'investimento'
                              ? 'text-blue-400'
                              : 'text-red-400'
                          )}
                        >
                          {transaction.type === 'receita' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="px-2 sm:px-4">
                        <DropdownMenu
                          trigger={
                            <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0 opacity-0 group-hover/row:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                        >
                          <DropdownMenuItem onClick={() => openEditModal(transaction)}>
                            <Pencil className="h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem destructive onClick={() => handleDelete(transaction.id)}>
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
