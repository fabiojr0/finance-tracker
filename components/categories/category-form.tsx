'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IconPicker } from '@/components/shared/icon-picker'
import { CreateCategoryInput, CategoryType } from '@/types/category'
import { cn } from '@/lib/utils/cn'
import { usePreferences } from '@/lib/contexts/preferences-context'
import { categoriesDict } from '@/lib/i18n/sections/categories'
import { TrendingDown, TrendingUp, LineChart, ArrowLeftRight, Tag, Palette } from 'lucide-react'

interface CategoryFormProps {
  onSubmit: (data: CreateCategoryInput) => Promise<void>
  onCancel?: () => void
  defaultValues?: Partial<CreateCategoryInput>
  isLoading?: boolean
}

const typeOptions = [
  {
    value: 'despesa',
    icon: TrendingDown,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500',
  },
  {
    value: 'receita',
    icon: TrendingUp,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500',
  },
  {
    value: 'investimento',
    icon: LineChart,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500',
  },
  {
    value: 'transferencia',
    icon: ArrowLeftRight,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500',
  },
] as const

export function CategoryForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading,
}: CategoryFormProps) {
  const { locale, t: tCommon } = usePreferences()
  const t = categoriesDict[locale]

  const [formData, setFormData] = useState<CreateCategoryInput>({
    name: defaultValues?.name || '',
    type: defaultValues?.type || 'despesa',
    icon: defaultValues?.icon || 'wallet',
    color: defaultValues?.color || '#f97316',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      {/* Category Type Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
          <Tag className="h-4 w-4 text-neutral-500" />
          {t.categoryType}
        </label>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          {typeOptions.map((option) => {
            const Icon = option.icon
            const isSelected = formData.type === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: option.value as CategoryType })}
                disabled={isLoading}
                className={cn(
                  'flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg border-2 transition-all',
                  'hover:bg-neutral-800/50 disabled:cursor-not-allowed disabled:opacity-50',
                  isSelected
                    ? `${option.bgColor} ${option.borderColor}`
                    : 'border-neutral-700 bg-neutral-900'
                )}
              >
                <Icon className={cn('h-4 w-4 flex-shrink-0', isSelected ? option.color : 'text-neutral-400')} />
                <span className={cn('text-xs sm:text-sm font-medium', isSelected ? option.color : 'text-neutral-300')}>
                  {tCommon.transactionTypes[option.value]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Name Input */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-neutral-300 flex items-center gap-2">
          <Tag className="h-4 w-4 text-neutral-500" />
          {t.categoryName}
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={t.namePlaceholder}
          required
          disabled={isLoading}
          className={cn(
            'h-10 sm:h-11',
            'border-neutral-700 hover:border-neutral-600'
          )}
        />
      </div>

      {/* Icon and Color Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Icon Picker */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
            <Tag className="h-4 w-4 text-neutral-500" />
            {t.icon}
          </Label>
          <IconPicker
            value={formData.icon || 'wallet'}
            onChange={(icon) => setFormData({ ...formData, icon })}
            disabled={isLoading}
          />
        </div>

        {/* Color Picker */}
        <div className="space-y-2">
          <Label htmlFor="color" className="text-sm font-medium text-neutral-300 flex items-center gap-2">
            <Palette className="h-4 w-4 text-neutral-500" />
            {t.color}
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              disabled={isLoading}
              className="h-10 sm:h-11 w-14 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              disabled={isLoading}
              className="h-10 sm:h-11 flex-1 font-mono text-sm"
              placeholder="#f97316"
            />
          </div>
        </div>
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
            {tCommon.common.cancel}
          </Button>
        )}
        <Button type="submit" disabled={isLoading || !formData.name.trim()} size="sm" className="sm:h-10 px-4 sm:px-6">
          {isLoading ? tCommon.common.saving : tCommon.common.save}
        </Button>
      </div>
    </form>
  )
}
