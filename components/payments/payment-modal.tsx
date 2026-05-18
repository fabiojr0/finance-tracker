'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Modal, ModalHeader, ModalContent } from '@/components/ui/modal'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { PaymentForm, PaymentFormData } from './payment-form'
import { useFinance } from '@/lib/contexts/finance-context'
import { TransactionWithCategory, CreateTransactionInput } from '@/types/transaction'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  editingPayment: TransactionWithCategory | null
  defaultDueDate?: string
}

const INFINITE_COUNT: Record<'mensal' | 'semanal' | 'anual', number> = {
  mensal: 60,
  semanal: 104,
  anual: 30,
}

function addOccurrences(baseISO: string, recurrence: PaymentFormData['recurrence'], count: number): string[] {
  const dates: string[] = []
  const [y, m, d] = baseISO.split('-').map(Number)
  for (let i = 0; i < count; i++) {
    const date = new Date(y, m - 1, d)
    if (recurrence === 'mensal') date.setMonth(date.getMonth() + i)
    else if (recurrence === 'semanal') date.setDate(date.getDate() + i * 7)
    else if (recurrence === 'anual') date.setFullYear(date.getFullYear() + i)
    const yy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    dates.push(`${yy}-${mm}-${dd}`)
  }
  return dates
}

export function PaymentModal({
  isOpen,
  onClose,
  editingPayment,
  defaultDueDate,
}: PaymentModalProps) {
  const { createTransaction, bulkCreateTransactions, updateTransaction, deleteTransaction } = useFinance()
  const confirm = useConfirm()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true)
    try {
      if (editingPayment) {
        const updateInput: Partial<CreateTransactionInput> = {
          type: data.type,
          amount: data.amount,
          description: data.description,
          date: data.due_date,
          category_id: data.category_id || undefined,
          notes: data.notes || undefined,
          status: editingPayment.status as CreateTransactionInput['status'],
        }
        const { error } = await updateTransaction(editingPayment.id, updateInput)
        if (error) {
          toast.error(error)
          return
        }
        toast.success('Pagamento atualizado')
        onClose()
        return
      }

      const isRecurring = data.recurrence !== 'unica'
      let count = 1
      if (isRecurring) {
        if (data.duration === 'infinite' && data.recurrence !== 'unica') {
          count = INFINITE_COUNT[data.recurrence]
        } else {
          count = data.occurrences
        }
      }
      const dates = addOccurrences(data.due_date, data.recurrence, count)
      const seriesId = isRecurring && count > 1 ? crypto.randomUUID() : null

      const rows: CreateTransactionInput[] = dates.map((date) => ({
        type: data.type,
        amount: data.amount,
        description: data.description,
        date,
        category_id: data.category_id || undefined,
        notes: data.notes || undefined,
        status: 'pendente',
        is_recurring: isRecurring,
        recurring_frequency: isRecurring ? data.recurrence : undefined,
        series_id: seriesId,
      }))

      if (rows.length === 1) {
        const { error } = await createTransaction(rows[0])
        if (error) {
          toast.error(error)
          return
        }
      } else {
        const { error } = await bulkCreateTransactions(rows)
        if (error) {
          toast.error(error)
          return
        }
      }

      toast.success(
        rows.length === 1
          ? 'Pagamento agendado'
          : `${rows.length} pagamentos agendados`
      )
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!editingPayment) return
    const ok = await confirm({
      title: 'Excluir pagamento?',
      description: `"${editingPayment.description}" será removido. Esta ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      variant: 'destructive',
    })
    if (!ok) return
    setIsSubmitting(true)
    const { error } = await deleteTransaction(editingPayment.id)
    setIsSubmitting(false)
    if (error) {
      toast.error(error)
      return
    }
    toast.success('Pagamento excluído')
    onClose()
  }

  const defaultValues: Partial<PaymentFormData> | undefined = editingPayment
    ? {
        type: (editingPayment.type === 'receita' ? 'despesa' : editingPayment.type) as PaymentFormData['type'],
        amount: Number(editingPayment.amount),
        description: editingPayment.description,
        due_date: editingPayment.date,
        category_id: editingPayment.category_id || '',
        notes: editingPayment.notes || '',
        recurrence: 'unica',
        duration: 'fixed',
        occurrences: 1,
      }
    : defaultDueDate
      ? { due_date: defaultDueDate }
      : undefined

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader onClose={onClose}>
        {editingPayment ? 'Editar Pagamento' : 'Novo Pagamento Agendado'}
      </ModalHeader>
      <ModalContent>
        <PaymentForm
          key={editingPayment?.id || 'new'}
          onSubmit={handleSubmit}
          onCancel={onClose}
          onDelete={editingPayment ? handleDelete : undefined}
          isLoading={isSubmitting}
          defaultValues={defaultValues}
          hideRecurrence={!!editingPayment}
        />
      </ModalContent>
    </Modal>
  )
}
