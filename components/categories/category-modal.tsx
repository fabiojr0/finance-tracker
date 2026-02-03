'use client'

import { useState, createContext, useContext, useCallback, ReactNode } from 'react'
import { Modal, ModalHeader, ModalContent } from '@/components/ui/modal'
import { CategoryForm } from './category-form'
import { useFinance } from '@/lib/contexts/finance-context'
import { CreateCategoryInput } from '@/types/category'

interface CategoryModalContextType {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

const CategoryModalContext = createContext<CategoryModalContextType | undefined>(undefined)

export function useCategoryModal() {
  const context = useContext(CategoryModalContext)
  if (!context) {
    throw new Error('useCategoryModal must be used within a CategoryModalProvider')
  }
  return context
}

interface CategoryModalProviderProps {
  children: ReactNode
}

export function CategoryModalProvider({ children }: CategoryModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = useCallback(() => setIsOpen(true), [])
  const closeModal = useCallback(() => setIsOpen(false), [])

  return (
    <CategoryModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
      <CategoryModal isOpen={isOpen} onClose={closeModal} />
    </CategoryModalContext.Provider>
  )
}

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
}

function CategoryModal({ isOpen, onClose }: CategoryModalProps) {
  const { createCategory } = useFinance()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: CreateCategoryInput) => {
    setIsSubmitting(true)
    const { error } = await createCategory(data)
    setIsSubmitting(false)

    if (!error) {
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader onClose={onClose}>Nova Categoria</ModalHeader>
      <ModalContent>
        <CategoryForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isSubmitting}
        />
      </ModalContent>
    </Modal>
  )
}
