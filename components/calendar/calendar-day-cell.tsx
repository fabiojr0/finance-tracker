'use client'

import { cn } from '@/lib/utils/cn'
import { formatCurrency } from '@/lib/utils/format-currency'
import { TransactionWithCategory } from '@/types/transaction'
import { Plus } from 'lucide-react'
import { isToday, isSameMonth } from 'date-fns'
import type { CalendarViewMode } from './calendar-header'

interface CalendarDayCellProps {
  date: Date
  transactions: TransactionWithCategory[]
  currentMonth: Date
  viewMode: CalendarViewMode
  onAddTransaction: (date: string) => void
  onDrillDown?: (date: Date) => void
}

export function CalendarDayCell({
  date,
  transactions,
  currentMonth,
  viewMode,
  onAddTransaction,
  onDrillDown,
}: CalendarDayCellProps) {
  const today = isToday(date)
  const inCurrentMonth = isSameMonth(date, currentMonth)
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

  const totalIncome = transactions
    .filter((t) => t.type === 'receita' && t.status === 'concluida')
    .reduce((s, t) => s + Number(t.amount), 0)

  const totalExpenses = transactions
    .filter((t) => t.type === 'despesa' && t.status === 'concluida')
    .reduce((s, t) => s + Number(t.amount), 0)

  // Year view: compact mini cell
  if (viewMode === 'year') {
    const intensity = Math.min(totalExpenses / 500, 1)
    const hasIncome = totalIncome > 0
    const hasExpense = totalExpenses > 0

    return (
      <button
        onClick={() => onDrillDown?.(date)}
        className={cn(
          'aspect-square rounded-sm text-[10px] flex items-center justify-center transition-all duration-150',
          'hover:ring-1 hover:ring-primary/50',
          !inCurrentMonth && 'opacity-30',
          today && 'ring-1 ring-primary font-bold text-primary'
        )}
        style={
          hasExpense
            ? { backgroundColor: `rgba(239, 68, 68, ${0.1 + intensity * 0.5})` }
            : hasIncome
            ? { backgroundColor: 'rgba(34, 197, 94, 0.15)' }
            : undefined
        }
        title={`${date.getDate()} — Receitas: ${formatCurrency(totalIncome)} | Despesas: ${formatCurrency(totalExpenses)}`}
      >
        <span className={cn(
          today ? 'text-primary' : inCurrentMonth ? 'text-neutral-400' : 'text-neutral-600'
        )}>
          {date.getDate()}
        </span>
      </button>
    )
  }

  // Month and Week view
  const maxVisible = viewMode === 'week' ? 20 : 3
  const visibleTransactions = transactions.slice(0, maxVisible)
  const hiddenCount = transactions.length - maxVisible

  return (
    <div
      onClick={() => onAddTransaction(dateStr)}
      className={cn(
        'group/cell relative border border-neutral-800/50 rounded-lg p-1.5 sm:p-2 transition-colors duration-150 cursor-pointer',
        viewMode === 'week' ? 'min-h-[200px]' : 'min-h-[90px] sm:min-h-[110px]',
        !inCurrentMonth && 'opacity-40 bg-neutral-950/50',
        inCurrentMonth && 'bg-neutral-900/30 hover:bg-neutral-900/60',
        today && 'ring-1 ring-primary/60 bg-primary/5'
      )}
    >
      {/* Day number + add button */}
      <div className="flex items-center justify-between mb-1">
        <button
          onClick={(e) => { e.stopPropagation(); onDrillDown?.(date) }}
          className={cn(
            'text-xs sm:text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full transition-colors',
            today
              ? 'bg-primary text-white'
              : inCurrentMonth
              ? 'text-neutral-300 hover:bg-neutral-800'
              : 'text-neutral-600'
          )}
        >
          {date.getDate()}
        </button>
        <div
          className="h-5 w-5 flex items-center justify-center rounded-full bg-primary/20 text-primary opacity-60 group-hover/cell:opacity-100 transition-opacity"
          title="Ver transações do dia"
        >
          <Plus className="h-3 w-3" />
        </div>
      </div>

      {/* Totals */}
      {(totalIncome > 0 || totalExpenses > 0) && (
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          {totalIncome > 0 && (
            <span className="text-[10px] font-medium text-emerald-400/80 tabular-nums">
              +{formatCurrency(totalIncome)}
            </span>
          )}
          {totalExpenses > 0 && (
            <span className="text-[10px] font-medium text-red-400/80 tabular-nums">
              -{formatCurrency(totalExpenses)}
            </span>
          )}
        </div>
      )}

      {/* Transaction list */}
      <div className="space-y-0.5">
        {visibleTransactions.map((t) => (
          <div
            key={t.id}
            className={cn(
              'flex items-center gap-1 px-1 py-0.5 rounded text-[10px] sm:text-xs truncate',
              t.type === 'receita' && 'bg-emerald-500/10 text-emerald-400',
              t.type === 'despesa' && 'bg-red-500/10 text-red-400',
              t.type === 'investimento' && 'bg-blue-500/10 text-blue-400',
              t.type === 'transferencia' && 'bg-amber-500/10 text-amber-400'
            )}
            title={`${t.description} — ${formatCurrency(Number(t.amount))}`}
          >
            <span className="truncate flex-1">{t.description}</span>
            <span className="tabular-nums font-medium flex-shrink-0">
              {formatCurrency(Number(t.amount))}
            </span>
          </div>
        ))}
        {hiddenCount > 0 && (
          <span className="text-[10px] text-neutral-500 px-1">
            +{hiddenCount} mais
          </span>
        )}
      </div>
    </div>
  )
}
