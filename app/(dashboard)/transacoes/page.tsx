'use client'

import { useState, useMemo } from 'react'
import {
  Plus,
  Trash2,
  Pencil,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  LineChart,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton, SkeletonTable } from '@/components/shared/skeleton'
import { CategoryIcon } from '@/components/shared/category-icon'
import { useTransactionModal } from '@/components/transactions/transaction-modal'
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

  const { openModal } = useTransactionModal()

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Sorting
  const [sortField, setSortField] = useState<SortField | null>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle: desc → asc → null (deselect) → desc
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

    // Apply filters
    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter)
    }
    if (categoryFilter !== 'all') {
      result = result.filter((t) => t.category_id === categoryFilter)
    }
    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter)
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(query) ||
          t.category?.name?.toLowerCase().includes(query)
      )
    }
    // Date range filter
    if (startDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      result = result.filter((t) => new Date(t.date) >= start)
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      result = result.filter((t) => new Date(t.date) <= end)
    }

    // Apply sorting (only if a field is selected)
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
  }, [transactions, typeFilter, categoryFilter, statusFilter, searchQuery, startDate, endDate, sortField, sortDirection])

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      await deleteTransaction(id)
    }
  }

  const clearFilters = () => {
    setTypeFilter('all')
    setCategoryFilter('all')
    setStatusFilter('all')
    setSearchQuery('')
    setStartDate('')
    setEndDate('')
  }

  const hasActiveFilters =
    typeFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all' || searchQuery !== '' || startDate !== '' || endDate !== ''

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'receita':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case 'despesa':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case 'investimento':
        return <LineChart className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { bg: string; text: string; label: string }> = {
      receita: { bg: 'bg-green-500/20', text: 'text-green-500', label: 'Receita' },
      despesa: { bg: 'bg-red-500/20', text: 'text-red-500', label: 'Despesa' },
      investimento: { bg: 'bg-blue-500/20', text: 'text-blue-500', label: 'Investimento' },
      transferencia: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', label: 'Transferência' },
    }
    const variant = variants[type] || variants.despesa
    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap', variant.bg, variant.text)}>
        {variant.label}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string; label: string }> = {
      concluida: { bg: 'bg-green-500/20', text: 'text-green-500', label: 'Concluída' },
      pendente: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', label: 'Pendente' },
      cancelada: { bg: 'bg-neutral-500/20', text: 'text-neutral-400', label: 'Cancelada' },
    }
    const variant = variants[status] || variants.pendente
    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap', variant.bg, variant.text)}>
        {variant.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-9 w-9 sm:h-10 sm:w-36 rounded-md" />
        </div>
        {/* Filters Skeleton */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-full sm:w-40" />
                <Skeleton className="h-9 flex-1 sm:w-32" />
                <Skeleton className="h-9 flex-1 sm:w-32 hidden sm:block" />
                <Skeleton className="h-9 flex-1 sm:w-32" />
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Table Skeleton */}
        <SkeletonTable rows={8} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-200">Transações</h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-0.5">
            {filteredAndSortedTransactions.length} transações
            {hasActiveFilters && ` (filtrado de ${transactions.length})`}
          </p>
        </div>
        <Button onClick={openModal} size="sm" className="sm:h-10">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Nova Transação</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3">
            {/* First row - Search and basic filters */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 text-neutral-400">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:inline">Filtros:</span>
              </div>

              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-40 lg:w-48 h-9"
              />

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-9 rounded-md border border-neutral-700 bg-neutral-800 px-2 sm:px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary flex-1 sm:flex-none min-w-0"
              >
                <option value="all">Todos os tipos</option>
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
                <option value="investimento">Investimento</option>
                <option value="transferencia">Transferência</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 rounded-md border border-neutral-700 bg-neutral-800 px-2 sm:px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary flex-1 sm:flex-none min-w-0 hidden sm:block"
              >
                <option value="all">Todas as categorias</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-md border border-neutral-700 bg-neutral-800 px-2 sm:px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary flex-1 sm:flex-none min-w-0"
              >
                <option value="all">Todos os status</option>
                <option value="concluida">Concluída</option>
                <option value="pendente">Pendente</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            {/* Second row - Date filters */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 text-neutral-400">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Período:</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 rounded-md border border-neutral-700 bg-neutral-800 px-2 sm:px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
                  placeholder="Data inicial"
                />
                <span className="text-neutral-500 text-sm">até</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 rounded-md border border-neutral-700 bg-neutral-800 px-2 sm:px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
                  placeholder="Data final"
                />
              </div>

              {/* Mobile category filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 rounded-md border border-neutral-700 bg-neutral-800 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary flex-1 min-w-0 sm:hidden"
              >
                <option value="all">Todas categorias</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 ml-auto sm:ml-0">
                  <X className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Limpar</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filteredAndSortedTransactions.length === 0 ? (
            <div className="p-4 sm:p-6">
              <EmptyState
                title={hasActiveFilters ? 'Nenhuma transação encontrada' : 'Nenhuma transação ainda'}
                description={
                  hasActiveFilters
                    ? 'Tente ajustar os filtros para ver mais resultados.'
                    : 'Comece adicionando sua primeira transação para começar a acompanhar suas finanças.'
                }
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-neutral-800">
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
                    <TableRow key={transaction.id}>
                      <TableCell className="py-2 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div
                            className={cn(
                              'flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full flex-shrink-0',
                              transaction.type === 'receita'
                                ? 'bg-green-500/20'
                                : transaction.type === 'investimento'
                                ? 'bg-blue-500/20'
                                : 'bg-red-500/20'
                            )}
                          >
                            {getTypeIcon(transaction.type)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-neutral-200 text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">
                              {transaction.description}
                            </p>
                            {/* Mobile: show category under description */}
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
                            'font-semibold text-sm sm:text-base whitespace-nowrap',
                            transaction.type === 'receita'
                              ? 'text-green-500'
                              : transaction.type === 'investimento'
                              ? 'text-blue-500'
                              : 'text-red-500'
                          )}
                        >
                          {transaction.type === 'receita' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="px-2 sm:px-4">
                        <DropdownMenu
                          trigger={
                            <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                        >
                          <DropdownMenuItem>
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
