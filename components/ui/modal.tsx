'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, children, className }: ModalProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={cn(
          'relative z-10 w-full bg-neutral-900 border border-neutral-800 shadow-2xl',
          // Mobile: slide up from bottom, full width
          'rounded-t-2xl sm:rounded-xl',
          'max-h-[90vh] sm:max-h-[85vh] overflow-hidden',
          'sm:mx-4 sm:max-w-lg',
          // Animation
          'animate-in fade-in-0 duration-200',
          'slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95',
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

interface ModalHeaderProps {
  children: React.ReactNode
  onClose?: () => void
  className?: string
}

export function ModalHeader({ children, onClose, className }: ModalHeaderProps) {
  return (
    <div className={cn(
      'flex items-center justify-between p-4 sm:p-6 border-b border-neutral-800',
      className
    )}>
      <h2 className="text-lg font-semibold text-neutral-200">{children}</h2>
      {onClose && (
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-200 transition-colors p-1 -mr-1"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

interface ModalContentProps {
  children: React.ReactNode
  className?: string
}

export function ModalContent({ children, className }: ModalContentProps) {
  return (
    <div className={cn(
      'p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)] sm:max-h-[calc(85vh-80px)]',
      className
    )}>
      {children}
    </div>
  )
}
