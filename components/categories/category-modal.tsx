'use client'

import { useState, createContext, useContext, useCallback, ReactNode } from 'react'
import { Modal, ModalHeader, ModalContent } from '@/components/ui/modal'
import { CategoryForm } from './category-form'
import { useFinance } from '@/lib/contexts/finance-context'
import { CreateCategoryInput, CategoryType, Category } from '@/types/category'

interface CategoryModalContextType {
  isOpen: boolean
  openModal: (defaultType?: CategoryType) => void
  openEditModal: (category: Category) => void
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
  const [defaultType, setDefaultType] = useState<CategoryType | undefined>(undefined)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const openModal = useCallback((type?: CategoryType) => {
    setEditingCategory(null)
    setDefaultType(type)
    setIsOpen(true)
  }, [])

  const openEditModal = useCallback((category: Category) => {
    setEditingCategory(category)
    setDefaultType(undefined)
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    setDefaultType(undefined)
    setEditingCategory(null)
  }, [])

  return (
    <CategoryModalContext.Provider value={{ isOpen, openModal, openEditModal, closeModal }}>
      {children}
      <CategoryModal
        isOpen={isOpen}
        onClose={closeModal}
        defaultType={defaultType}
        editingCategory={editingCategory}
      />
    </CategoryModalContext.Provider>
  )
}

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  defaultType?: CategoryType
  editingCategory: Category | null
}

function CategoryModal({ isOpen, onClose, defaultType, editingCategory }: CategoryModalProps) {
  const { createCategory, updateCategory } = useFinance()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: CreateCategoryInput) => {
    setIsSubmitting(true)

    if (editingCategory) {
      const { error } = await updateCategory(editingCategory.id, data)
      setIsSubmitting(false)
      if (!error) onClose()
    } else {
      const { error } = await createCategory(data)
      setIsSubmitting(false)
      if (!error) onClose()
    }
  }

  const defaultValues = editingCategory
    ? {
        name: editingCategory.name,
        type: editingCategory.type as CategoryType,
        icon: editingCategory.icon || undefined,
        color: editingCategory.color || undefined,
      }
    : defaultType
    ? { type: defaultType }
    : undefined

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader onClose={onClose}>
        {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
      </ModalHeader>
      <ModalContent>
        <CategoryForm
          key={editingCategory?.id || defaultType || 'default'}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isSubmitting}
          defaultValues={defaultValues}
        />
      </ModalContent>
    </Modal>
  )
}
