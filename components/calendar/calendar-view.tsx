'use client'

import { useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  format,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TransactionWithCategory } from '@/types/transaction'
import { CalendarDayCell } from './calendar-day-cell'
import type { CalendarViewMode } from './calendar-header'
import { cn } from '@/lib/utils/cn'

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

interface CalendarViewProps {
  currentDate: Date
  viewMode: CalendarViewMode
  transactions: TransactionWithCategory[]
  onAddTransaction: (date: string) => void
  onDrillDown: (date: Date, targetMode: CalendarViewMode) => void
}

function getTransactionsForDate(transactions: TransactionWithCategory[], date: Date) {
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return transactions.filter((t) => t.date === dateStr)
}

export function CalendarView({
  currentDate,
  viewMode,
  transactions,
  onAddTransaction,
  onDrillDown,
}: CalendarViewProps) {
  // ── Month View ─────────────────────────────────────────
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentDate])

  // ── Week View ──────────────────────────────────────────
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
    return eachDayOfInterval({ start: weekStart, end: weekEnd })
  }, [currentDate])

  // ── Year View ──────────────────────────────────────────
  const yearMonths = useMemo(() => {
    const yearStart = startOfYear(currentDate)
    const yearEnd = endOfYear(currentDate)
    return eachMonthOfInterval({ start: yearStart, end: yearEnd })
  }, [currentDate])

  if (viewMode === 'year') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {yearMonths.map((month) => {
          const monthStart = startOfMonth(month)
          const monthEnd = endOfMonth(month)
          const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
          const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
          const days = eachDayOfInterval({ start: calStart, end: calEnd })

          return (
            <div
              key={month.toISOString()}
              className="bg-neutral-900/50 border border-neutral-800/50 rounded-xl p-3 hover:border-neutral-700 transition-colors"
            >
              <button
                onClick={() => onDrillDown(month, 'month')}
                className="text-sm font-semibold text-neutral-200 capitalize mb-2 block hover:text-primary transition-colors"
              >
                {format(month, 'MMMM', { locale: ptBR })}
              </button>
              {/* Mini weekday labels */}
              <div className="grid grid-cols-7 gap-px mb-1">
                {WEEKDAY_LABELS.map((label) => (
                  <div
                    key={label}
                    className="text-[8px] text-center text-neutral-600 font-medium"
                  >
                    {label.charAt(0)}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px">
                {days.map((day) => (
                  <CalendarDayCell
                    key={day.toISOString()}
                    date={day}
                    transactions={getTransactionsForDate(transactions, day)}
                    currentMonth={month}
                    viewMode="year"
                    onAddTransaction={onAddTransaction}
                    onDrillDown={(d) => onDrillDown(d, 'month')}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (viewMode === 'week') {
    return (
      <div>
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {WEEKDAY_LABELS.map((label, i) => (
            <div
              key={label}
              className={cn(
                'text-xs font-medium text-center py-2 rounded-lg',
                i === 0 || i === 6
                  ? 'text-neutral-500'
                  : 'text-neutral-400'
              )}
            >
              {label}
            </div>
          ))}
        </div>
        {/* Days */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <CalendarDayCell
              key={day.toISOString()}
              date={day}
              transactions={getTransactionsForDate(transactions, day)}
              currentMonth={currentDate}
              viewMode="week"
              onAddTransaction={onAddTransaction}
              onDrillDown={(d) => onDrillDown(d, 'week')}
            />
          ))}
        </div>
      </div>
    )
  }

  // ── Month View (default) ───────────────────────────────
  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={cn(
              'text-xs font-medium text-center py-2 rounded-lg',
              i === 0 || i === 6
                ? 'text-neutral-500'
                : 'text-neutral-400'
            )}
          >
            {label}
          </div>
        ))}
      </div>
      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {monthDays.map((day) => (
          <CalendarDayCell
            key={day.toISOString()}
            date={day}
            transactions={getTransactionsForDate(transactions, day)}
            currentMonth={currentDate}
            viewMode="month"
            onAddTransaction={onAddTransaction}
            onDrillDown={(d) => onDrillDown(d, 'week')}
          />
        ))}
      </div>
    </div>
  )
}
