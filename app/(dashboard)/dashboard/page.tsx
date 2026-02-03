'use client'

import { useMemo } from 'react'
import { Wallet, TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, LineChart, ArrowRight } from 'lucide-react'
import { StatsCard } from '@/components/dashboard/stats-card'
import { FinancialEvolutionChart } from '@/components/dashboard/financial-evolution-chart'
import { ExpensesByCategoryChart } from '@/components/dashboard/expenses-by-category-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { SkeletonCard, SkeletonChart, SkeletonTransactionList } from '@/components/shared/skeleton'
import { CategoryIcon } from '@/components/shared/category-icon'
import { useFinance } from '@/lib/contexts/finance-context'
import { formatCurrency } from '@/lib/utils/format-currency'
import { formatDate } from '@/lib/utils/format-date'
import Link from 'next/link'

export default function DashboardPage() {
  const { transactions, transactionsLoading: loading } = useFinance()

  // Calcular estatísticas do mês atual e anterior
  const stats = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const filterByMonth = (month: number, year: number) =>
      transactions.filter((t) => {
        const transactionDate = new Date(t.date)
        return (
          transactionDate.getMonth() === month &&
          transactionDate.getFullYear() === year &&
          t.status === 'concluida'
        )
      })

    const currentMonthTransactions = filterByMonth(currentMonth, currentYear)
    const prevMonthTransactions = filterByMonth(prevMonth, prevYear)

    const calcStats = (txs: typeof transactions) => {
      const income = txs
        .filter((t) => t.type === 'receita')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      const expenses = txs
        .filter((t) => t.type === 'despesa')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      const investments = txs
        .filter((t) => t.type === 'investimento')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      return { income, expenses, investments, balance: income - expenses - investments }
    }

    const current = calcStats(currentMonthTransactions)
    const prev = calcStats(prevMonthTransactions)

    const calcTrend = (curr: number, previous: number) => {
      if (previous === 0) return { value: curr > 0 ? 100 : 0, isPositive: curr >= 0 }
      const change = Math.round(((curr - previous) / Math.abs(previous)) * 100)
      return { value: Math.abs(change), isPositive: change >= 0 }
    }

    return {
      income: current.income,
      expenses: current.expenses,
      balance: current.balance,
      investments: current.investments,
      trends: {
        balance: calcTrend(current.balance, prev.balance),
        income: calcTrend(current.income, prev.income),
        expenses: calcTrend(current.expenses, prev.expenses),
        investments: calcTrend(current.investments, prev.investments),
      },
    }
  }, [transactions])

  // Pegar últimas 5 transações
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }, [transactions])

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Stats Cards Skeleton */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        {/* Charts Skeleton */}
        <div className="grid gap-4 lg:grid-cols-2">
          <SkeletonChart />
          <SkeletonChart />
        </div>
        {/* Recent Transactions Skeleton */}
        <Card>
          <CardHeader className="pb-3 px-4 sm:px-6">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-2">
                <div className="h-5 w-40 bg-neutral-800 rounded animate-pulse" />
                <div className="h-4 w-32 bg-neutral-800 rounded animate-pulse" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-4 sm:px-6">
            <SkeletonTransactionList rows={5} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Saldo Total"
          value={stats.balance}
          icon={Wallet}
          variant="default"
          trend={stats.trends.balance}
        />
        <StatsCard
          title="Receitas"
          value={stats.income}
          icon={TrendingUp}
          variant="income"
          trend={stats.trends.income}
        />
        <StatsCard
          title="Despesas"
          value={stats.expenses}
          icon={TrendingDown}
          variant="expense"
          trend={stats.trends.expenses}
        />
        <StatsCard
          title="Investimentos"
          value={stats.investments}
          icon={LineChart}
          variant="investment"
          trend={stats.trends.investments}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <FinancialEvolutionChart transactions={transactions} />
        <ExpensesByCategoryChart transactions={transactions} />
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="pb-3 px-4 sm:px-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg">Transações Recentes</CardTitle>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 sm:mt-1 truncate">
                Últimas movimentações
              </p>
            </div>
            <Link href="/transacoes" className="flex items-center gap-1 text-primary hover:text-primary-400 text-sm font-medium transition-colors flex-shrink-0">
              <span className="hidden sm:inline">Ver todas</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-4 sm:px-6">
          {recentTransactions.length === 0 ? (
            <EmptyState
              title="Nenhuma transação ainda"
              description="Comece adicionando sua primeira transação para começar a acompanhar suas finanças."
              icon={<Wallet className="h-12 w-12" />}
              action={
                <Link href="/transacoes">
                  <Button>Adicionar Transação</Button>
                </Link>
              }
            />
          ) : (
            <div className="divide-y divide-neutral-800">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-3 sm:py-4 first:pt-0 last:pb-0 gap-3"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div
                      className={`flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full flex-shrink-0 ${
                        transaction.type === 'receita'
                          ? 'bg-green-500/20'
                          : transaction.type === 'investimento'
                          ? 'bg-blue-500/20'
                          : 'bg-red-500/20'
                      }`}
                    >
                      {transaction.type === 'receita' ? (
                        <ArrowDownLeft className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                      ) : transaction.type === 'investimento' ? (
                        <LineChart className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white text-sm sm:text-base truncate">
                        {transaction.description}
                      </p>
                      <p className="text-xs sm:text-sm text-neutral-500 flex items-center gap-1 truncate">
                        {transaction.category ? (
                          <>
                            <CategoryIcon icon={transaction.category.icon} size="sm" className="flex-shrink-0" />
                            <span className="truncate">{transaction.category.name}</span>
                          </>
                        ) : (
                          'Sem categoria'
                        )}
                        <span className="hidden sm:inline"> • {formatDate(transaction.date)}</span>
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm sm:text-base font-semibold flex-shrink-0 ${
                      transaction.type === 'receita'
                        ? 'text-green-500'
                        : transaction.type === 'investimento'
                        ? 'text-blue-500'
                        : 'text-red-500'
                    }`}
                  >
                    {transaction.type === 'receita' ? '+ ' : '- '}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
