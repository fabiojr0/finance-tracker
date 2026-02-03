import { LucideIcon } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format-currency'
import { cn } from '@/lib/utils/cn'

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'income' | 'expense' | 'savings' | 'investment'
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
}: StatsCardProps) {
  const variantStyles = {
    default: {
      border: 'border-primary-500/40',
      bg: 'bg-primary-500/20 ',
      iconBg: 'bg-primary-500/30',
      iconColor: 'text-primary-500',
    },
    income: {
      border: 'border-green-500/40',
      bg: 'bg-green-500/20 ',
      iconBg: 'bg-green-500/30',
      iconColor: 'text-green-500',
    },
    expense: {
      border: 'border-red-500/40',
      bg: 'bg-red-500/20 ',
      iconBg: 'bg-red-500/30',
      iconColor: 'text-red-500',
    },
    savings: {
      border: 'border-primary-400/40',
      bg: 'bg-card/60 ',
      iconBg: 'bg-primary-400/30',
      iconColor: 'text-primary-400',
    },
    investment: {
      border: 'border-blue-500/40',
      bg: 'bg-blue-500/20',
      iconBg: 'bg-blue-500/30',
      iconColor: 'text-blue-500',
    },
  }

  const styles = variantStyles[variant]

  return (
    <div
      className={cn(
        'rounded-xl border p-3 sm:p-5',
        styles.border,
        styles.bg
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 sm:space-y-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-neutral-400 truncate">{title}</p>
          <p className="text-lg sm:text-2xl font-bold text-white truncate">
            {formatCurrency(value)}
          </p>
          {trend && (
            <p
              className={cn(
                'text-xs sm:text-sm font-medium truncate',
                trend.isPositive ? 'text-green-500' : 'text-red-500'
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
              <span className="hidden sm:inline"> vs. mês anterior</span>
            </p>
          )}
        </div>
        <div className={cn('rounded-lg p-1.5 sm:p-2 flex-shrink-0', styles.iconBg)}>
          <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5', styles.iconColor)} />
        </div>
      </div>
    </div>
  )
}
