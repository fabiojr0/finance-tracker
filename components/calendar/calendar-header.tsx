'use client'

import { Button } from '@/components/ui/button'
import { UI_TEXT } from '@/lib/constants/ui-text'
import { cn } from '@/lib/utils/cn'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import {
  format,
  addMonths,
  subMonths,
  addYears,
  subYears,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type CalendarViewMode = 'year' | 'month' | 'week'

interface CalendarHeaderProps {
  currentDate: Date
  viewMode: CalendarViewMode
  onDateChange: (date: Date) => void
  onViewModeChange: (mode: CalendarViewMode) => void
}

export function CalendarHeader({
  currentDate,
  viewMode,
  onDateChange,
  onViewModeChange,
}: CalendarHeaderProps) {
  const handlePrev = () => {
    switch (viewMode) {
      case 'year':
        onDateChange(subYears(currentDate, 1))
        break
      case 'month':
        onDateChange(subMonths(currentDate, 1))
        break
      case 'week':
        onDateChange(subWeeks(currentDate, 1))
        break
    }
  }

  const handleNext = () => {
    switch (viewMode) {
      case 'year':
        onDateChange(addYears(currentDate, 1))
        break
      case 'month':
        onDateChange(addMonths(currentDate, 1))
        break
      case 'week':
        onDateChange(addWeeks(currentDate, 1))
        break
    }
  }

  const handleToday = () => {
    onDateChange(new Date())
  }

  const getTitle = () => {
    switch (viewMode) {
      case 'year':
        return format(currentDate, 'yyyy')
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: ptBR })
      case 'week': {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
        const startStr = format(weekStart, 'dd MMM', { locale: ptBR })
        const endStr = format(weekEnd, 'dd MMM yyyy', { locale: ptBR })
        return `${startStr} – ${endStr}`
      }
    }
  }

  const viewModes: { key: CalendarViewMode; label: string }[] = [
    { key: 'year', label: UI_TEXT.calendar.viewYear },
    { key: 'month', label: UI_TEXT.calendar.viewMonth },
    { key: 'week', label: UI_TEXT.calendar.viewWeek },
  ]

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Title + navigation */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            className="h-8 w-8 p-0 text-neutral-400 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            className="h-8 w-8 p-0 text-neutral-400 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-white capitalize">
          {getTitle()}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          className="h-7 text-xs px-2.5"
        >
          <CalendarDays className="h-3 w-3 mr-1" />
          {UI_TEXT.calendar.today}
        </Button>
      </div>

      {/* View mode toggle */}
      <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-1">
        {viewModes.map((mode) => (
          <button
            key={mode.key}
            onClick={() => onViewModeChange(mode.key)}
            className={cn(
              'px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200',
              viewMode === mode.key
                ? 'bg-primary text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  )
}
