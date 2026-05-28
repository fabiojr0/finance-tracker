'use client'

import { Button } from '@/components/ui/button'
import { usePreferences } from '@/lib/contexts/preferences-context'
import { calendarDict } from '@/lib/i18n/sections/calendar'
import { cn } from '@/lib/utils/cn'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import {
  addMonths,
  subMonths,
  addYears,
  subYears,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
} from 'date-fns'

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
  const { locale, localeTag } = usePreferences()
  const t = calendarDict[locale]

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
        return currentDate.toLocaleDateString(localeTag, { year: 'numeric' })
      case 'month':
        return currentDate.toLocaleDateString(localeTag, {
          month: 'long',
          year: 'numeric',
        })
      case 'week': {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
        const startStr = weekStart.toLocaleDateString(localeTag, {
          day: '2-digit',
          month: 'short',
        })
        const endStr = weekEnd.toLocaleDateString(localeTag, {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        return `${startStr} – ${endStr}`
      }
    }
  }

  const viewModes: { key: CalendarViewMode; label: string }[] = [
    { key: 'year', label: t.viewYear },
    { key: 'month', label: t.viewMonth },
    { key: 'week', label: t.viewWeek },
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
          {t.today}
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
