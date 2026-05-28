'use client'

import { useState, useEffect } from 'react'
import { Filter, X, Calendar } from 'lucide-react'
import { Modal, ModalHeader, ModalContent } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { DateInput } from '@/components/ui/date-input'
import { usePreferences } from '@/lib/contexts/preferences-context'
import { transactionsDict } from '@/lib/i18n/sections/transactions'
import { Category } from '@/types/category'

export interface TransactionFilters {
  typeFilter: string
  categoryFilter: string
  statusFilter: string
  searchQuery: string
  startDate: string
  endDate: string
}

interface TransactionFilterModalProps {
  isOpen: boolean
  onClose: () => void
  filters: TransactionFilters
  onApplyFilters: (filters: TransactionFilters) => void
  categories: Category[]
}

export function TransactionFilterModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  categories,
}: TransactionFilterModalProps) {
  const { t, locale } = usePreferences()
  const tx = transactionsDict[locale]
  const [localFilters, setLocalFilters] = useState<TransactionFilters>(filters)

  // Sync local filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters)
    }
  }, [isOpen, filters])

  const handleApply = () => {
    // Preserve searchQuery from original filters since it's managed outside modal
    onApplyFilters({ ...localFilters, searchQuery: filters.searchQuery })
    onClose()
  }

  const handleClear = () => {
    setLocalFilters({
      ...localFilters,
      typeFilter: 'all',
      categoryFilter: 'all',
      statusFilter: 'all',
      startDate: '',
      endDate: '',
    })
  }

  const hasActiveFilters =
    localFilters.typeFilter !== 'all' ||
    localFilters.categoryFilter !== 'all' ||
    localFilters.statusFilter !== 'all' ||
    localFilters.startDate !== '' ||
    localFilters.endDate !== ''

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader onClose={onClose}>{tx.filterTitle}</ModalHeader>
      <ModalContent className="overflow-visible">
        <div className="space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              {tx.colType}
            </label>
            <select
              value={localFilters.typeFilter}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, typeFilter: e.target.value })
              }
              className="w-full h-10 rounded-md border border-neutral-700 bg-neutral-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">{tx.allTypes}</option>
              <option value="receita">{t.transactionTypes.receita}</option>
              <option value="despesa">{t.transactionTypes.despesa}</option>
              <option value="investimento">{t.transactionTypes.investimento}</option>
              <option value="transferencia">{t.transactionTypes.transferencia}</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              {tx.colCategory}
            </label>
            <select
              value={localFilters.categoryFilter}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, categoryFilter: e.target.value })
              }
              className="w-full h-10 rounded-md border border-neutral-700 bg-neutral-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">{tx.allCategories}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              {tx.colStatus}
            </label>
            <select
              value={localFilters.statusFilter}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, statusFilter: e.target.value })
              }
              className="w-full h-10 rounded-md border border-neutral-700 bg-neutral-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">{tx.allStatuses}</option>
              <option value="concluida">{t.transactionStatus.concluida}</option>
              <option value="pendente">{t.transactionStatus.pendente}</option>
              <option value="cancelada">{t.transactionStatus.cancelada}</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {tx.period}
              </div>
            </label>
            <div className="flex items-center gap-2">
              <DateInput
                value={localFilters.startDate}
                onChange={(value) =>
                  setLocalFilters({ ...localFilters, startDate: value })
                }
                placeholder="dd/mm/aaaa"
                className="flex-1"
              />
              <span className="text-neutral-500 text-sm">{tx.dateRangeSeparator}</span>
              <DateInput
                value={localFilters.endDate}
                onChange={(value) =>
                  setLocalFilters({ ...localFilters, endDate: value })
                }
                placeholder="dd/mm/aaaa"
                className="flex-1"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-neutral-800">
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClear} className="flex-1">
                <X className="h-4 w-4 mr-2" />
                {tx.clearFiltersButton}
              </Button>
            )}
            <Button onClick={handleApply} className="flex-1">
              <Filter className="h-4 w-4 mr-2" />
              {tx.applyFilters}
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}

interface FilterTagProps {
  label: string
  onRemove: () => void
}

export function FilterTag({ label, onRemove }: FilterTagProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-primary/30 rounded-full p-0.5 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}
