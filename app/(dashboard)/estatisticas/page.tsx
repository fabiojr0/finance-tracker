'use client'

import { useState, useMemo } from 'react'
import { Skeleton, SkeletonChart } from '@/components/shared/skeleton'
import { CategoryChart } from '@/components/reports/category-chart'
import { TrendChart } from '@/components/reports/trend-chart'
import { MonthlyChart } from '@/components/dashboard/monthly-chart'
import { PeriodSelector, getDateRange, PeriodKey } from '@/components/shared/period-selector'
import { useFinance } from '@/lib/contexts/finance-context'
import { formatCurrency } from '@/lib/utils/format-currency'

export default function ReportsPage() {
  const { transactions, transactionsLoading: loading } = useFinance()
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('last-12-months')

  const dateRange = useMemo(() => getDateRange(selectedPeriod), [selectedPeriod])

  // Summary for reports
  const summary = useMemo(() => {
    const filtered = transactions.filter(t => {
      if (!dateRange) return t.status === 'concluida'
      const d = new Date(t.date)
      return d >= dateRange.startDate && d <= dateRange.endDate && t.status === 'concluida'
    })

    const income = filtered.filter(t => t.type === 'receita').reduce((s, t) => s + Number(t.amount), 0)
    const expenses = filtered.filter(t => t.type === 'despesa').reduce((s, t) => s + Number(t.amount), 0)
    const investments = filtered.filter(t => t.type === 'investimento').reduce((s, t) => s + Number(t.amount), 0)
    const months = dateRange
      ? Math.max(1, Math.round((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (30 * 24 * 60 * 60 * 1000)))
      : 1

    return {
      income,
      expenses,
      investments,
      balance: income - expenses - investments,
      avgExpenses: expenses / months,
      transactionCount: filtered.length,
    }
  }, [transactions, dateRange])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <SkeletonChart className="h-80" />
        <SkeletonChart className="h-80" />
        <SkeletonChart className="h-80" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Relatórios</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Análises e gráficos das suas finanças
          </p>
        </div>
        <PeriodSelector selected={selectedPeriod} onChange={setSelectedPeriod} />
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs font-medium text-neutral-400">Receitas</p>
          <p className="text-sm sm:text-lg font-bold text-emerald-400 mt-0.5 truncate tabular-nums">
            {formatCurrency(summary.income)}
          </p>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs font-medium text-neutral-400">Despesas</p>
          <p className="text-sm sm:text-lg font-bold text-red-400 mt-0.5 truncate tabular-nums">
            {formatCurrency(summary.expenses)}
          </p>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs font-medium text-neutral-400">Investimentos</p>
          <p className="text-sm sm:text-lg font-bold text-blue-400 mt-0.5 truncate tabular-nums">
            {formatCurrency(summary.investments)}
          </p>
        </div>
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs font-medium text-neutral-400">Média mensal</p>
          <p className="text-sm sm:text-lg font-bold text-orange-400 mt-0.5 truncate tabular-nums">
            {formatCurrency(summary.avgExpenses)}
          </p>
        </div>
      </div>

      <CategoryChart
        transactions={transactions}
        startDate={dateRange?.startDate}
        endDate={dateRange?.endDate}
      />
      <TrendChart
        transactions={transactions}
        startDate={dateRange?.startDate}
        endDate={dateRange?.endDate}
      />
      <MonthlyChart
        transactions={transactions}
        startDate={dateRange?.startDate}
        endDate={dateRange?.endDate}
      />
    </div>
  )
}
