'use client'

import { useState, createContext, useContext, useCallback, ReactNode } from 'react'
import { Modal, ModalHeader, ModalContent } from '@/components/ui/modal'
import { TransactionForm } from './transaction-form'
import { useFinance } from '@/lib/contexts/finance-context'
import { CreateTransactionInput } from '@/types/transaction'

interface TransactionModalContextType {
  isOpen: boolean
  openModal: () => void
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

  const openModal = useCallback(() => setIsOpen(true), [])
  const closeModal = useCallback(() => setIsOpen(false), [])

  return (
    <TransactionModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
      <TransactionModal isOpen={isOpen} onClose={closeModal} />
    </TransactionModalContext.Provider>
  )
}

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
}

function TransactionModal({ isOpen, onClose }: TransactionModalProps) {
  const { createTransaction } = useFinance()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: CreateTransactionInput) => {
    setIsSubmitting(true)
    const { error } = await createTransaction(data)
    setIsSubmitting(false)

    if (!error) {
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader onClose={onClose}>Nova Transação</ModalHeader>
      <ModalContent>
        <TransactionForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isSubmitting}
        />
      </ModalContent>
    </Modal>
  )
}
