'use client'

import { Modal, ModalHeader, ModalContent } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { TransactionWithCategory } from '@/types/transaction'
import { formatCurrency } from '@/lib/utils/format-currency'
import { formatDate } from '@/lib/utils/format-date'
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
  const totalIncome = transactions
    .filter((t) => t.type === 'receita' && t.status === 'concluida')
    .reduce((s, t) => s + Number(t.amount), 0)

  const totalExpenses = transactions
    .filter((t) => t.type === 'despesa' && t.status === 'concluida')
    .reduce((s, t) => s + Number(t.amount), 0)

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader onClose={onClose}>
        {formatDate(date, "dd 'de' MMMM 'de' yyyy")}
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
                    {formatCurrency(totalIncome)}
                  </span>
                </div>
              )}
              {totalExpenses > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
                  <ArrowUpRight className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-xs font-medium text-red-400 tabular-nums">
                    {formatCurrency(totalExpenses)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Transaction list */}
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-neutral-500 mb-3">Nenhuma transação neste dia</p>
              <Button
                size="sm"
                onClick={() => {
                  onClose()
                  onAddTransaction(date)
                }}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Adicionar Transação
              </Button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {transactions.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onClose()
                    onEditTransaction(t)
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left',
                    'hover:bg-neutral-800/80 group/item'
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center h-8 w-8 rounded-lg flex-shrink-0',
                      t.type === 'receita' && 'bg-emerald-500/15',
                      t.type === 'despesa' && 'bg-red-500/15',
                      t.type === 'investimento' && 'bg-blue-500/15',
                      t.type === 'transferencia' && 'bg-amber-500/15'
                    )}
                  >
                    {getTypeIcon(t.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-200 truncate">
                      {t.description}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {t.category?.name || 'Sem categoria'}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'text-sm font-semibold tabular-nums flex-shrink-0',
                      t.type === 'receita' ? 'text-emerald-400' : t.type === 'investimento' ? 'text-blue-400' : 'text-red-400'
                    )}
                  >
                    {t.type === 'receita' ? '+' : '-'}
                    {formatCurrency(Number(t.amount))}
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
                Adicionar Transação
              </Button>
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  )
}
