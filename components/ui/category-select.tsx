'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { CategoryIcon } from '@/components/shared/category-icon'

interface Category {
  id: string
  name: string
  icon: string
  type: string
}

interface CategorySelectProps {
  value: string
  onChange: (value: string) => void
  categories: Category[]
  placeholder?: string
  disabled?: boolean
  error?: boolean
}

export function CategorySelect({
  value,
  onChange,
  categories,
  placeholder = 'Selecione uma categoria',
  disabled,
  error,
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 })
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const menuRef = React.useRef<HTMLDivElement>(null)

  const selectedCategory = categories.find((cat) => cat.id === value)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    function handleScroll() {
      if (isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen])

  const handleToggle = () => {
    if (disabled) return
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
    setIsOpen(!isOpen)
  }

  const handleSelect = (categoryId: string) => {
    onChange(categoryId)
    setIsOpen(false)
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border bg-neutral-900 px-3 py-2 text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-950',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-red-500' : 'border-neutral-700 hover:border-neutral-600',
          isOpen && 'ring-2 ring-primary ring-offset-2 ring-offset-neutral-950'
        )}
      >
        {selectedCategory ? (
          <div className="flex items-center gap-2">
            <CategoryIcon icon={selectedCategory.icon} size="sm" />
            <span className="text-neutral-200">{selectedCategory.name}</span>
          </div>
        ) : (
          <span className="text-neutral-500">{placeholder}</span>
        )}
        <ChevronDown
          className={cn(
            'h-4 w-4 text-neutral-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[100] rounded-md border border-neutral-700 bg-neutral-900 py-1 shadow-xl animate-in fade-in-0 zoom-in-95 duration-100"
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
              maxHeight: '240px',
              overflowY: 'auto',
            }}
          >
            {categories.length === 0 ? (
              <div className="px-3 py-2 text-sm text-neutral-500">
                Nenhuma categoria disponível
              </div>
            ) : (
              categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleSelect(category.id)}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors',
                    'hover:bg-neutral-800 focus:bg-neutral-800 focus:outline-none',
                    value === category.id ? 'bg-neutral-800' : ''
                  )}
                >
                  <CategoryIcon icon={category.icon} size="sm" />
                  <span className="flex-1 text-left text-neutral-200">
                    {category.name}
                  </span>
                  {value === category.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))
            )}
          </div>,
          document.body
        )}
    </>
  )
}
