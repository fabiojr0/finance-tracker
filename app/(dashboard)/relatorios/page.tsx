'use client'

import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { CategoryChart } from '@/components/reports/category-chart'
import { TrendChart } from '@/components/reports/trend-chart'
import { MonthlyChart } from '@/components/dashboard/monthly-chart'
import { useFinance } from '@/lib/contexts/finance-context'

export default function ReportsPage() {
  const { transactions, transactionsLoading: loading } = useFinance()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
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

      <CategoryChart transactions={transactions} />
      <TrendChart transactions={transactions} />
      <MonthlyChart transactions={transactions} />
    </div>
  )
}
