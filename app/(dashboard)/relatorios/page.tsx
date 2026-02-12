'use client'

import { useState, useMemo } from 'react'
import { Skeleton, SkeletonChart } from '@/components/shared/skeleton'
import { CategoryChart } from '@/components/reports/category-chart'
import { TrendChart } from '@/components/reports/trend-chart'
import { MonthlyChart } from '@/components/dashboard/monthly-chart'
import { PeriodSelector, getDateRange, PeriodKey } from '@/components/shared/period-selector'
import { useFinance } from '@/lib/contexts/finance-context'

export default function ReportsPage() {
  const { transactions, transactionsLoading: loading } = useFinance()
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('last-12-months')

  const dateRange = useMemo(() => getDateRange(selectedPeriod), [selectedPeriod])

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-5 w-64" />
        </div>
        {/* Charts Skeleton */}
        <SkeletonChart className="h-80" />
        <SkeletonChart className="h-80" />
        <SkeletonChart className="h-80" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-200">Relatórios</h1>
        <p className="text-neutral-400 mt-1">
          Análises e gráficos das suas finanças
        </p>
      </div>

      <PeriodSelector selected={selectedPeriod} onChange={setSelectedPeriod} />

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
