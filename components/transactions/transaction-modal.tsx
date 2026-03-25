'use client'

import { useState, createContext, useContext, useCallback, ReactNode } from 'react'
import { Modal, ModalHeader, ModalContent } from '@/components/ui/modal'
import { TransactionForm } from './transaction-form'
import { useFinance } from '@/lib/contexts/finance-context'
import { CreateTransactionInput, TransactionWithCategory } from '@/types/transaction'

interface TransactionModalContextType {
  isOpen: boolean
  openModal: (defaultDate?: string) => void
  openEditModal: (transaction: TransactionWithCategory) => void
  closeModal: () => void
}

const TransactionModalContext = createContext<TransactionModalContextType | undefined>(undefined)

export function useTransactionModal() {
  const context = useContext(TransactionModalContext)
  if (!context) {
    throw new Error('useTransactionModal must be used within a TransactionModalProvider')
  }
  return context
}

interface TransactionModalProviderProps {
  children: ReactNode
}

export function TransactionModalProvider({ children }: TransactionModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategory | null>(null)
  const [defaultDate, setDefaultDate] = useState<string | undefined>(undefined)

  const openModal = useCallback((date?: string) => {
    setEditingTransaction(null)
    setDefaultDate(date)
    setIsOpen(true)
  }, [])

  const openEditModal = useCallback((transaction: TransactionWithCategory) => {
    setEditingTransaction(transaction)
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    setEditingTransaction(null)
    setDefaultDate(undefined)
  }, [])

  return (
    <TransactionModalContext.Provider value={{ isOpen, openModal, openEditModal, closeModal }}>
      {children}
      <TransactionModal isOpen={isOpen} onClose={closeModal} editingTransaction={editingTransaction} defaultDate={defaultDate} />
    </TransactionModalContext.Provider>
  )
}

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  editingTransaction: TransactionWithCategory | null
  defaultDate?: string
}

function TransactionModal({ isOpen, onClose, editingTransaction, defaultDate }: TransactionModalProps) {
  const { createTransaction, updateTransaction, deleteTransaction } = useFinance()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: CreateTransactionInput) => {
    setIsSubmitting(true)

    if (editingTransaction) {
      const { error } = await updateTransaction(editingTransaction.id, data)
      setIsSubmitting(false)
      if (!error) onClose()
    } else {
      const { error } = await createTransaction(data)
      setIsSubmitting(false)
      if (!error) onClose()
    }
  }

  const handleDelete = async () => {
    if (!editingTransaction) return
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      setIsSubmitting(true)
      const { error } = await deleteTransaction(editingTransaction.id)
      setIsSubmitting(false)
      if (!error) onClose()
    }
  }

  const defaultValues = editingTransaction
    ? {
        type: editingTransaction.type as CreateTransactionInput['type'],
        amount: Number(editingTransaction.amount),
        description: editingTransaction.description,
        date: editingTransaction.date,
        category_id: editingTransaction.category_id || '',
        notes: editingTransaction.notes || '',
        status: editingTransaction.status as CreateTransactionInput['status'],
      }
    : defaultDate
    ? { type: 'despesa' as const, date: defaultDate, status: 'concluida' as const }
    : undefined

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader onClose={onClose}>
        {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
      </ModalHeader>
      <ModalContent>
        <TransactionForm
          key={editingTransaction?.id || 'new'}
          onSubmit={handleSubmit}
          onCancel={onClose}
          onDelete={editingTransaction ? handleDelete : undefined}
          isLoading={isSubmitting}
          defaultValues={defaultValues}
        />
      </ModalContent>
    </Modal>
  )
}
