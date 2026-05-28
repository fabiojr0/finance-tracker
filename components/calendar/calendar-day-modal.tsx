'use client'

import { Modal, ModalHeader, ModalContent } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { TransactionWithCategory } from '@/types/transaction'
import { usePreferences } from '@/lib/contexts/preferences-context'
import { calendarDict } from '@/lib/i18n/sections/calendar'
import { cn } from '@/lib/utils/cn'
import { Plus, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, LineChart } from 'lucide-react'

interface CalendarDayModalProps {
  isOpen: boolean
  onClose: () => void
  date: string
  transactions: TransactionWithCategory[]
  onAddTransaction: (date: string) => void
  onEditTransaction: (transaction: TransactionWithCategory) => void
}

function getTypeIcon(type: string) {
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

export function CalendarDayModal({
  isOpen,
  onClose,
  date,
  transactions,
  onAddTransaction,
  onEditTransaction,
}: CalendarDayModalProps) {
  const { locale, formatMoney, localeTag } = usePreferences()
  const t = calendarDict[locale]

  // Parse the YYYY-MM-DD string into a local date (avoids UTC day shifts).
  const [y, m, d] = date.split('-').map(Number)
  const dateObj = new Date(y, (m || 1) - 1, d || 1)
  const formattedDate = dateObj.toLocaleDateString(localeTag, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const totalIncome = transactions
    .filter((t) => t.type === 'receita' && t.status === 'concluida')
    .reduce((s, t) => s + Number(t.amount), 0)

  const totalExpenses = transactions
    .filter((t) => t.type === 'despesa' && t.status === 'concluida')
    .reduce((s, t) => s + Number(t.amount), 0)

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader onClose={onClose}>
        <span className="capitalize">{formattedDate}</span>
      </ModalHeader>
      <ModalContent>
        <div className="space-y-4">
          {/* Summary */}
          {(totalIncome > 0 || totalExpenses > 0) && (
            <div className="flex items-center gap-3 flex-wrap">
              {totalIncome > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-400 tabular-nums">
                    {formatMoney(totalIncome)}
                  </span>
                </div>
              )}
              {totalExpenses > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
                  <ArrowUpRight className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-xs font-medium text-red-400 tabular-nums">
                    {formatMoney(totalExpenses)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Transaction list */}
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-neutral-500 mb-3">{t.noTransactionsThisDay}</p>
              <Button
                size="sm"
                onClick={() => {
                  onClose()
                  onAddTransaction(date)
                }}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                {t.addTransaction}
              </Button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {transactions.map((tx) => (
                <button
                  key={tx.id}
                  onClick={() => {
                    onClose()
                    onEditTransaction(tx)
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left',
                    'hover:bg-neutral-800/80 group/item'
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center h-8 w-8 rounded-lg flex-shrink-0',
                      tx.type === 'receita' && 'bg-emerald-500/15',
                      tx.type === 'despesa' && 'bg-red-500/15',
                      tx.type === 'investimento' && 'bg-blue-500/15',
                      tx.type === 'transferencia' && 'bg-amber-500/15'
                    )}
                  >
                    {getTypeIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-200 truncate">
                      {tx.description}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {tx.category?.name || t.noCategory}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'text-sm font-semibold tabular-nums flex-shrink-0',
                      tx.type === 'receita' ? 'text-emerald-400' : tx.type === 'investimento' ? 'text-blue-400' : 'text-red-400'
                    )}
                  >
                    {tx.type === 'receita' ? '+' : '-'}
                    {formatMoney(Number(tx.amount))}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Add transaction button when there are transactions */}
          {transactions.length > 0 && (
            <div className="pt-2 border-t border-neutral-800">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  onClose()
                  onAddTransaction(date)
                }}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                {t.addTransaction}
              </Button>
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  )
}
