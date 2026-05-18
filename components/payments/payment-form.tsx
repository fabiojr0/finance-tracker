'use client'

import { useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { CategorySelect } from '@/components/ui/category-select'
import { useFinance } from '@/lib/contexts/finance-context'
import { useCategoryModal } from '@/components/categories/category-modal'
import { CategoryType } from '@/types/category'
import { cn } from '@/lib/utils/cn'
import {
  ArrowUpRight,
  LineChart,
  ArrowLeftRight,
  Calendar,
  DollarSign,
  FileText,
  Tag,
  Repeat,
  Infinity as InfinityIcon,
  Hash,
} from 'lucide-react'

const RECURRENCE_OPTIONS = [
  { value: 'unica', label: 'Uma vez' },
  { value: 'mensal', label: 'Mensal' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'anual', label: 'Anual' },
] as const

type Recurrence = (typeof RECURRENCE_OPTIONS)[number]['value']

export const paymentFormSchema = z
  .object({
    type: z.enum(['despesa', 'transferencia', 'investimento']),
    description: z
      .string()
      .min(3, 'Descrição deve ter no mínimo 3 caracteres')
      .max(255, 'Descrição deve ter no máximo 255 caracteres'),
    amount: z
      .number({ message: 'Informe um valor' })
      .positive('Valor deve ser positivo'),
    due_date: z.string().min(1, 'Data de vencimento é obrigatória'),
    category_id: z.string().optional(),
    notes: z.string().optional(),
    recurrence: z.enum(['unica', 'mensal', 'semanal', 'anual']),
    duration: z.enum(['fixed', 'infinite']),
    occurrences: z
      .number({ message: 'Informe a quantidade' })
      .int()
      .min(1, 'Mínimo 1')
      .max(360, 'Máximo 360'),
  })
  .refine(
    (data) =>
      data.recurrence === 'unica' ||
      data.duration === 'infinite' ||
      data.occurrences >= 1,
    {
      path: ['occurrences'],
      message: 'Informe a quantidade',
    }
  )

export type PaymentFormData = z.infer<typeof paymentFormSchema>

const typeOptions = [
  {
    value: 'despesa' as const,
    label: 'Despesa',
    icon: ArrowUpRight,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500',
  },
  {
    value: 'transferencia' as const,
    label: 'Transferência',
    icon: ArrowLeftRight,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500',
  },
  {
    value: 'investimento' as const,
    label: 'Investimento',
    icon: LineChart,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500',
  },
]

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => Promise<void>
  onCancel?: () => void
  onDelete?: () => void
  defaultValues?: Partial<PaymentFormData>
  isLoading?: boolean
  hideRecurrence?: boolean
}

export function PaymentForm({
  onSubmit,
  onCancel,
  onDelete,
  defaultValues,
  isLoading,
  hideRecurrence = false,
}: PaymentFormProps) {
  const { categories } = useFinance()
  const { openModal: openCategoryModal } = useCategoryModal()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      type: 'despesa',
      due_date: new Date().toISOString().slice(0, 10),
      recurrence: 'unica',
      duration: 'fixed',
      occurrences: 1,
      ...defaultValues,
    },
  })

  const paymentType = watch('type')
  const recurrence = watch('recurrence')
  const duration = watch('duration')

  const filteredCategories = categories.filter((cat) => {
    if (paymentType === 'transferencia') return cat.type === 'despesa'
    return cat.type === paymentType
  })

  const prevTypeRef = useRef(paymentType)
  useEffect(() => {
    if (prevTypeRef.current !== paymentType) {
      prevTypeRef.current = paymentType
      setValue('category_id', '')
    }
  }, [paymentType, setValue])

  useEffect(() => {
    if (recurrence === 'unica') {
      setValue('occurrences', 1)
      setValue('duration', 'fixed')
    }
  }, [recurrence, setValue])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit(onSubmit)(e)
      }}
      className="space-y-4 sm:space-y-5"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
          <Tag className="h-4 w-4 text-neutral-500" />
          Tipo
        </label>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {typeOptions.map((option) => {
            const Icon = option.icon
            const isSelected = paymentType === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setValue('type', option.value)}
                disabled={isLoading}
                className={cn(
                  'flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border-2 transition-all',
                  'hover:bg-neutral-800/50 disabled:cursor-not-allowed disabled:opacity-50',
                  isSelected
                    ? `${option.bgColor} ${option.borderColor}`
                    : 'border-neutral-700 bg-neutral-900'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 flex-shrink-0',
                    isSelected ? option.color : 'text-neutral-400'
                  )}
                />
                <span
                  className={cn(
                    'text-xs sm:text-sm font-medium truncate',
                    isSelected ? option.color : 'text-neutral-300'
                  )}
                >
                  {option.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="text-sm font-medium text-neutral-300 flex items-center gap-2"
        >
          <FileText className="h-4 w-4 text-neutral-500" />
          Descrição
        </label>
        <input
          id="description"
          placeholder="Ex: Aluguel, Internet, Netflix"
          {...register('description')}
          disabled={isLoading}
          className={cn(
            'flex h-10 sm:h-11 w-full rounded-lg border bg-neutral-900 px-3 py-2 text-sm',
            'placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary',
            'disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            errors.description
              ? 'border-red-500'
              : 'border-neutral-700 hover:border-neutral-600'
          )}
        />
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="amount"
            className="text-sm font-medium text-neutral-300 flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4 text-neutral-500" />
            Valor
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-medium">
              R$
            </span>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => {
                const formatCurrency = (value: number | undefined) => {
                  if (!value && value !== 0) return ''
                  return value.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                }
                const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                  const digits = e.target.value.replace(/[^\d]/g, '')
                  if (digits === '') {
                    field.onChange(undefined)
                    return
                  }
                  field.onChange(parseFloat(digits) / 100)
                }
                return (
                  <input
                    id="amount"
                    type="text"
                    inputMode="numeric"
                    placeholder="0,00"
                    value={formatCurrency(field.value)}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={cn(
                      'flex h-10 sm:h-11 w-full rounded-lg border bg-neutral-900 pl-10 pr-3 py-2 text-sm',
                      'placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary',
                      'disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
                      errors.amount
                        ? 'border-red-500'
                        : 'border-neutral-700 hover:border-neutral-600'
                    )}
                  />
                )
              }}
            />
          </div>
          {errors.amount && (
            <p className="text-xs text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="due_date"
            className="text-sm font-medium text-neutral-300 flex items-center gap-2"
          >
            <Calendar className="h-4 w-4 text-neutral-500" />
            Vencimento
          </label>
          <input
            id="due_date"
            type="date"
            {...register('due_date')}
            disabled={isLoading}
            className={cn(
              'flex h-10 sm:h-11 w-full rounded-lg border bg-neutral-900 px-3 py-2 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-primary',
              'disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
              '[color-scheme:dark]',
              errors.due_date
                ? 'border-red-500'
                : 'border-neutral-700 hover:border-neutral-600'
            )}
          />
          {errors.due_date && (
            <p className="text-xs text-red-500">{errors.due_date.message}</p>
          )}
        </div>
      </div>

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
              onCreateNew={() =>
                openCategoryModal(
                  (paymentType === 'transferencia'
                    ? 'despesa'
                    : paymentType) as CategoryType
                )
              }
            />
          )}
        />
      </div>

      {!hideRecurrence && (
        <div className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/50 p-3">
          <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
            <Repeat className="h-4 w-4 text-neutral-500" />
            Recorrência
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {RECURRENCE_OPTIONS.map((opt) => {
              const isSelected = recurrence === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue('recurrence', opt.value as Recurrence)}
                  disabled={isLoading}
                  className={cn(
                    'py-2 px-1 text-xs font-medium rounded-md border transition-colors',
                    isSelected
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                  )}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>

          {recurrence !== 'unica' && (
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setValue('duration', 'fixed')}
                  disabled={isLoading}
                  className={cn(
                    'flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-medium rounded-md border transition-colors',
                    duration === 'fixed'
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                  )}
                >
                  <Hash className="h-3.5 w-3.5" />
                  Quantidade fixa
                </button>
                <button
                  type="button"
                  onClick={() => setValue('duration', 'infinite')}
                  disabled={isLoading}
                  className={cn(
                    'flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-medium rounded-md border transition-colors',
                    duration === 'infinite'
                      ? 'bg-purple-500/15 border-purple-500 text-purple-400'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                  )}
                >
                  <InfinityIcon className="h-3.5 w-3.5" />
                  Indefinida
                </button>
              </div>

              {duration === 'fixed' ? (
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="occurrences"
                    className="text-xs text-neutral-400 flex-shrink-0"
                  >
                    Ocorrências
                  </label>
                  <input
                    id="occurrences"
                    type="number"
                    min={1}
                    max={360}
                    {...register('occurrences', { valueAsNumber: true })}
                    disabled={isLoading}
                    className="w-20 h-9 rounded-md border border-neutral-700 bg-neutral-900 px-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
                  />
                </div>
              ) : (
                <p className="text-[11px] text-purple-300/80 leading-relaxed">
                  Serão geradas várias ocorrências futuras automaticamente
                  (5 anos para mensal, 2 anos para semanal, 30 anos para anual).
                  Você poderá excluir a série a qualquer momento.
                </p>
              )}
            </div>
          )}

          {errors.occurrences && (
            <p className="text-xs text-red-500">{errors.occurrences.message}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="notes"
          className="text-sm font-medium text-neutral-300 flex items-center gap-2"
        >
          <FileText className="h-4 w-4 text-neutral-500" />
          Observações
          <span className="text-neutral-500 font-normal text-xs">(opcional)</span>
        </label>
        <textarea
          id="notes"
          {...register('notes')}
          rows={2}
          placeholder="Detalhes adicionais..."
          disabled={isLoading}
          className="flex w-full min-h-[60px] rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 resize-none"
        />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
        <div>
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              onClick={onDelete}
              disabled={isLoading}
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              Excluir
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
              size="sm"
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading} size="sm">
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </form>
  )
}
