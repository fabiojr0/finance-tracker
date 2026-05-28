'use client'

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal } from './modal'
import { Button } from './button'
import { usePreferences } from '@/lib/contexts/preferences-context'
import { sharedDict } from '@/lib/i18n/sections/shared'

export interface ConfirmOptions {
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

interface PendingState {
  options: ConfirmOptions
  resolve: (value: boolean) => void
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingState | null>(null)
  const pendingRef = useRef<PendingState | null>(null)
  pendingRef.current = pending

  const { locale, t: tCommon } = usePreferences()
  const t = sharedDict[locale]

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      setPending({ options, resolve })
    })
  }, [])

  const handleResolve = useCallback((value: boolean) => {
    const current = pendingRef.current
    if (!current) return
    setPending(null)
    current.resolve(value)
  }, [])

  const options = pending?.options
  const variant = options?.variant ?? 'destructive'
  const confirmLabel =
    options?.confirmLabel ??
    (variant === 'destructive' ? t.confirmDeleteLabel : tCommon.common.confirm)
  const cancelLabel = options?.cancelLabel ?? tCommon.common.cancel

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        isOpen={!!pending}
        onClose={() => handleResolve(false)}
        className="sm:max-w-md"
      >
        <div className="p-5 sm:p-6">
          <div className="flex gap-4">
            {variant === 'destructive' && (
              <div className="flex-shrink-0 rounded-full bg-red-500/15 p-2.5 h-fit">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-neutral-100">
                {options?.title}
              </h2>
              {options?.description && (
                <div className="mt-1.5 text-sm text-neutral-400 leading-relaxed">
                  {options.description}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-5 sm:mt-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleResolve(false)}
              className="sm:h-10 sm:px-5"
            >
              {cancelLabel}
            </Button>
            <Button
              variant={variant === 'destructive' ? 'destructive' : 'default'}
              size="sm"
              onClick={() => handleResolve(true)}
              className="sm:h-10 sm:px-5"
              autoFocus
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  )
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext)
  if (!ctx) {
    throw new Error('useConfirm must be used within ConfirmProvider')
  }
  return ctx
}
