'use client'

import { cn } from '@/lib/utils/cn'
import { Calendar } from 'lucide-react'

export type PeriodKey =
  | 'all'
  | 'this-month'
  | 'last-month'
  | 'last-3-months'
  | 'last-6-months'
  | 'last-12-months'
  | 'this-year'

interface PeriodOption {
  key: PeriodKey
  label: string
  shortLabel: string
}

const PERIOD_OPTIONS: PeriodOption[] = [
  { key: 'this-month', label: 'Este mês', shortLabel: 'Este mês' },
  { key: 'last-month', label: 'Mês anterior', shortLabel: 'Mês ant.' },
  { key: 'last-3-months', label: 'Últimos 3 meses', shortLabel: '3 meses' },
  { key: 'last-6-months', label: 'Últimos 6 meses', shortLabel: '6 meses' },
  { key: 'last-12-months', label: 'Últimos 12 meses', shortLabel: '12 meses' },
  { key: 'this-year', label: 'Este ano', shortLabel: 'Este ano' },
]

const ALL_OPTION: PeriodOption = { key: 'all', label: 'Todos', shortLabel: 'Todos' }

interface PeriodSelectorProps {
  selected: PeriodKey
  onChange: (period: PeriodKey) => void
  showAll?: boolean
  className?: string
}

export function getDateRange(period: PeriodKey): { startDate: Date; endDate: Date } | null {
  if (period === 'all') return null

  const now = new Date()
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  switch (period) {
    case 'this-month': {
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      return { startDate, endDate }
    }
    case 'last-month': {
      const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      return { startDate, endDate: end }
    }
    case 'last-3-months': {
      const startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      return { startDate, endDate }
    }
    case 'last-6-months': {
      const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1)
      return { startDate, endDate }
    }
    case 'last-12-months': {
      const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1)
      return { startDate, endDate }
    }
    case 'this-year': {
      const startDate = new Date(now.getFullYear(), 0, 1)
      return { startDate, endDate }
    }
  }
}

export function getPreviousPeriodRange(period: PeriodKey): { startDate: Date; endDate: Date } | null {
  const currentRange = getDateRange(period)
  if (!currentRange) return null

  const durationMs = currentRange.endDate.getTime() - currentRange.startDate.getTime()

  const endDate = new Date(currentRange.startDate.getTime() - 1)
  const startDate = new Date(endDate.getTime() - durationMs)

  return { startDate, endDate }
}

export function PeriodSelector({ selected, onChange, showAll = false, className }: PeriodSelectorProps) {
  const options = showAll ? [ALL_OPTION, ...PERIOD_OPTIONS] : PERIOD_OPTIONS

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Calendar className="h-4 w-4 text-neutral-500 flex-shrink-0 hidden sm:block" />
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
        {options.map((option) => (
          <button
            key={option.key}
            onClick={() => onChange(option.key)}
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
              selected === option.key
                ? 'bg-primary/20 text-primary'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            )}
          >
            <span className="sm:hidden">{option.shortLabel}</span>
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
