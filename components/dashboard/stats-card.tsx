import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
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
      gradient: 'from-orange-500/10 via-orange-500/5 to-transparent',
      border: 'border-orange-500/20 hover:border-orange-500/40',
      iconBg: 'bg-orange-500/15',
      iconColor: 'text-orange-400',
      glow: 'shadow-orange-500/5',
    },
    income: {
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-400',
      glow: 'shadow-emerald-500/5',
    },
    expense: {
      gradient: 'from-red-500/10 via-red-500/5 to-transparent',
      border: 'border-red-500/20 hover:border-red-500/40',
      iconBg: 'bg-red-500/15',
      iconColor: 'text-red-400',
      glow: 'shadow-red-500/5',
    },
    savings: {
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-400',
      glow: 'shadow-amber-500/5',
    },
    investment: {
      gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      border: 'border-blue-500/20 hover:border-blue-500/40',
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-400',
      glow: 'shadow-blue-500/5',
    },
  }

  const styles = variantStyles[variant]

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-neutral-900/80 backdrop-blur-sm p-4 sm:p-5 transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-0.5',
        styles.border,
        styles.glow
      )}
    >
      {/* Background gradient */}
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-100', styles.gradient)} />

      {/* Decorative circle */}
      <div className={cn(
        'absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-[0.07] transition-opacity duration-300 group-hover:opacity-[0.12]',
        styles.iconColor === 'text-orange-400' ? 'bg-orange-500' :
        styles.iconColor === 'text-emerald-400' ? 'bg-emerald-500' :
        styles.iconColor === 'text-red-400' ? 'bg-red-500' :
        styles.iconColor === 'text-blue-400' ? 'bg-blue-500' : 'bg-amber-500'
      )} />

      <div className="relative flex items-start justify-between gap-2">
        <div className="space-y-1 sm:space-y-2 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-neutral-400">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
            {formatCurrency(value)}
          </p>
          {trend && (
            <div className="flex items-center gap-1">
              <div
                className={cn(
                  'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold',
                  trend.isPositive
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-red-500/15 text-red-400'
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trend.value}%
              </div>
              <span className="text-[10px] sm:text-xs text-neutral-500 hidden sm:inline">
                vs. período anterior
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          'rounded-xl p-2 sm:p-2.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110',
          styles.iconBg
        )}>
          <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5', styles.iconColor)} />
        </div>
      </div>
    </div>
  )
}
