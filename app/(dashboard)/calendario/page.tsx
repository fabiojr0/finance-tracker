'use client'

import { useState, useCallback } from 'react'
import { Upload } from 'lucide-react'
import { useFinance } from '@/lib/contexts/finance-context'
import { useTransactionModal } from '@/components/transactions/transaction-modal'
import { CalendarHeader, CalendarViewMode } from '@/components/calendar/calendar-header'
import { CalendarView } from '@/components/calendar/calendar-view'
import { CalendarDayModal } from '@/components/calendar/calendar-day-modal'
import { ImportStatementModal } from '@/components/transactions/import-statement-modal'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/shared/skeleton'
import { TransactionWithCategory } from '@/types/transaction'

export default function CalendarPage() {
  const { transactions, transactionsLoading } = useFinance()
  const { openModal, openEditModal } = useTransactionModal()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month')
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // Day modal state
  const [dayModalOpen, setDayModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string>('')
  const [selectedDayTransactions, setSelectedDayTransactions] = useState<TransactionWithCategory[]>([])

  const handleOpenDayModal = useCallback(
    (dateStr: string) => {
      const dayTransactions = transactions.filter((t) => t.date === dateStr)
      setSelectedDay(dateStr)
      setSelectedDayTransactions(dayTransactions)
      setDayModalOpen(true)
    },
    [transactions]
  )

  const handleAddTransaction = useCallback(
    (date: string) => {
      openModal(date)
    },
    [openModal]
  )

  const handleEditTransaction = useCallback(
    (transaction: TransactionWithCategory) => {
      openEditModal(transaction)
    },
    [openEditModal]
  )

  const handleDrillDown = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (date: Date, _targetMode: CalendarViewMode) => {
      if (viewMode === 'year') {
        setViewMode('month')
        setCurrentDate(date)
      } else if (viewMode === 'month') {
        setViewMode('week')
        setCurrentDate(date)
      }
    },
    [viewMode]
  )

  if (transactionsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-56" />
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Calendário
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Visualize todas as suas transações organizadas por data
          </p>
        </div>
        <Button variant="outline" onClick={() => setIsImportModalOpen(true)} size="sm" className="sm:h-10 gap-1.5">
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Importar Extrato</span>
        </Button>
      </div>

      {/* Calendar header — navigation + view toggle */}
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onDateChange={setCurrentDate}
        onViewModeChange={setViewMode}
      />

      {/* Calendar grid */}
      <CalendarView
        currentDate={currentDate}
        viewMode={viewMode}
        transactions={transactions}
        onAddTransaction={handleOpenDayModal}
        onDrillDown={handleDrillDown}
      />

      {/* Import modal */}
      <ImportStatementModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {/* Day detail modal */}
      <CalendarDayModal
        isOpen={dayModalOpen}
        onClose={() => setDayModalOpen(false)}
        date={selectedDay}
        transactions={selectedDayTransactions}
        onAddTransaction={handleAddTransaction}
        onEditTransaction={handleEditTransaction}
      />
    </div>
  )
}
