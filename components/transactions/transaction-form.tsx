'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema } from '@/lib/utils/validation'
import { Button } from '@/components/ui/button'
import { CategorySelect } from '@/components/ui/category-select'
import { useFinance } from '@/lib/contexts/finance-context'
import { CreateTransactionInput } from '@/types/transaction'
import { z } from 'zod'
import { cn } from '@/lib/utils/cn'
import {
  ArrowDownLeft,
  ArrowUpRight,
  LineChart,
  ArrowLeftRight,
  Calendar,
  DollarSign,
  FileText,
  Tag,
  MessageSquare,
} from 'lucide-react'

type TransactionFormData = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  onSubmit: (data: CreateTransactionInput) => Promise<void>
  onCancel?: () => void
  defaultValues?: Partial<TransactionFormData>
  isLoading?: boolean
}

const typeOptions = [
  {
    value: 'despesa',
    label: 'Despesa',
    shortLabel: 'Despesa',
    icon: ArrowUpRight,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500',
  },
  {
    value: 'receita',
    label: 'Receita',
    shortLabel: 'Receita',
    icon: ArrowDownLeft,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500',
  },
  {
    value: 'investimento',
    label: 'Investimento',
    shortLabel: 'Invest.',
    icon: LineChart,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500',
  },
  {
    value: 'transferencia',
    label: 'Transferência',
    shortLabel: 'Transf.',
    icon: ArrowLeftRight,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500',
  },
]

export function TransactionForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading,
}: TransactionFormProps) {
  const { categories } = useFinance()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: defaultValues || {
      type: 'despesa',
      date: new Date().toISOString().split('T')[0],
      status: 'concluida',
    },
  })

  const transactionType = watch('type')

  // Filter categories by type
  const filteredCategories = categories.filter(
    (cat) => cat.type === transactionType
  )

  // Reset category when type changes
  useEffect(() => {
    if (transactionType) {
      setValue('category_id', '')
    }
  }, [transactionType, setValue])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit(onSubmit)(e)
      }}
      className="space-y-4 sm:space-y-5"
    >
      {/* Transaction Type Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
          <Tag className="h-4 w-4 text-neutral-500" />
          Tipo de Transação
        </label>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          {typeOptions.map((option) => {
            const Icon = option.icon
            const isSelected = transactionType === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setValue('type', option.value as TransactionFormData['type'])}
                disabled={isLoading}
                className={cn(
                  'flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg border-2 transition-all',
                  'hover:bg-neutral-800/50 disabled:cursor-not-allowed disabled:opacity-50',
                  isSelected
                    ? `${option.bgColor} ${option.borderColor}`
                    : 'border-neutral-700 bg-neutral-900'
                )}
              >
                <Icon className={cn('h-4 w-4 flex-shrink-0', isSelected ? option.color : 'text-neutral-400')} />
                <span className={cn('text-xs sm:text-sm font-medium truncate', isSelected ? option.color : 'text-neutral-300')}>
                  <span className="sm:hidden">{option.shortLabel}</span>
                  <span className="hidden sm:inline">{option.label}</span>
                </span>
              </button>
            )
          })}
        </div>
        {errors.type && (
          <p className="text-xs sm:text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>

      {/* Amount Input */}
      <div className="space-y-2">
        <label htmlFor="amount" className="text-sm font-medium text-neutral-300 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-neutral-500" />
          Valor
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-medium">
            R$
          </span>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            {...register('amount', { valueAsNumber: true })}
            disabled={isLoading}
            className={cn(
              'flex h-10 sm:h-11 w-full rounded-lg border bg-neutral-900 pl-10 pr-3 py-2 text-base font-medium',
              'placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-950',
              'disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
              errors.amount ? 'border-red-500' : 'border-neutral-700 hover:border-neutral-600'
            )}
          />
        </div>
        {errors.amount && (
          <p className="text-xs sm:text-sm text-red-500">{errors.amount.message}</p>
        )}
      </div>

      {/* Description Input */}
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-neutral-300 flex items-center gap-2">
          <FileText className="h-4 w-4 text-neutral-500" />
          Descrição
        </label>
        <input
          id="description"
          placeholder="Ex: Compras no mercado"
          {...register('description')}
          disabled={isLoading}
          className={cn(
            'flex h-10 sm:h-11 w-full rounded-lg border bg-neutral-900 px-3 py-2 text-sm',
            'placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-950',
            'disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            errors.description ? 'border-red-500' : 'border-neutral-700 hover:border-neutral-600'
          )}
        />
        {errors.description && (
          <p className="text-xs sm:text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Date and Category Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date Input */}
        <div className="space-y-2">
          <label htmlFor="date" className="text-sm font-medium text-neutral-300 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-neutral-500" />
            Data
          </label>
          <input
            id="date"
            type="date"
            {...register('date')}
            disabled={isLoading}
            className={cn(
              'flex h-10 sm:h-11 w-full rounded-lg border bg-neutral-900 px-3 py-2 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-950',
              'disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
              '[color-scheme:dark]',
              errors.date ? 'border-red-500' : 'border-neutral-700 hover:border-neutral-600'
            )}
          />
          {errors.date && (
            <p className="text-xs sm:text-sm text-red-500">{errors.date.message}</p>
          )}
        </div>

        {/* Category Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
            <Tag className="h-4 w-4 text-neutral-500" />
            Categoria
          </label>
          <Controller
            name="category_id"
            control={control}
            render={({ field }) => (
              <CategorySelect
                value={field.value || ''}
                onChange={field.onChange}
                categories={filteredCategories}
                placeholder="Selecione"
                disabled={isLoading}
                error={!!errors.category_id}
              />
            )}
          />
          {errors.category_id && (
            <p className="text-xs sm:text-sm text-red-500">{errors.category_id.message}</p>
          )}
        </div>
      </div>

      {/* Notes Textarea */}
      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium text-neutral-300 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-neutral-500" />
          Observações
          <span className="text-neutral-500 font-normal text-xs">(opcional)</span>
        </label>
        <textarea
          id="notes"
          {...register('notes')}
          className={cn(
            'flex min-h-[70px] sm:min-h-[80px] w-full rounded-lg border bg-neutral-900 px-3 py-2 text-sm',
            'placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-950',
            'disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none',
            'border-neutral-700 hover:border-neutral-600'
          )}
          rows={3}
          placeholder="Adicione observações..."
          disabled={isLoading}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 sm:gap-3 pt-2 border-t border-neutral-800">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
            size="sm"
            className="sm:h-10 px-4 sm:px-6"
          >
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading} size="sm" className="sm:h-10 px-4 sm:px-6">
          {isLoading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
