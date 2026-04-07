'use client'

import { useState, useMemo } from 'react'
import { Wallet, TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, LineChart, ArrowRight } from 'lucide-react'
import { StatsCard } from '@/components/dashboard/stats-card'
import { FinancialEvolutionChart } from '@/components/dashboard/financial-evolution-chart'
import { ExpensesByCategoryChart } from '@/components/dashboard/expenses-by-category-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { SkeletonCard, SkeletonChart, SkeletonTransactionList } from '@/components/shared/skeleton'
import { CategoryIcon } from '@/components/shared/category-icon'
import { PeriodSelector, getDateRange, getPreviousPeriodRange, PeriodKey } from '@/components/shared/period-selector'
import { useFinance } from '@/lib/contexts/finance-context'
import { useUser } from '@/lib/hooks/use-user'
import { formatCurrency } from '@/lib/utils/format-currency'
import { formatDate } from '@/lib/utils/format-date'
import Link from 'next/link'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

function getFirstName(email?: string) {
  if (!email) return ''
  const name = email.split('@')[0]
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export default function DashboardPage() {
  const { transactions, transactionsLoading: loading } = useFinance()
  const { user } = useUser()
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('custom')

  const dateRange = useMemo(() => getDateRange(selectedPeriod), [selectedPeriod])
  const prevRange = useMemo(() => getPreviousPeriodRange(selectedPeriod), [selectedPeriod])

  // Estatísticas: custom = mês atual, outros = período selecionado
  const stats = useMemo(() => {
    const now = new Date()

    const filterByRange = (start: Date, end: Date) =>
      transactions.filter((t) => {
        const d = new Date(t.date)
        return d >= start && d <= end && t.status === 'concluida'
      })

    let currentTransactions
    let prevTransactions

    if (selectedPeriod === 'custom') {
      // Custom: cards mostram mês atual, trend vs mês anterior
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

      currentTransactions = filterByRange(currentMonthStart, currentMonthEnd)
      prevTransactions = filterByRange(prevMonthStart, prevMonthEnd)
    } else if (dateRange) {
      currentTransactions = filterByRange(dateRange.startDate, dateRange.endDate)
      prevTransactions = prevRange
        ? filterByRange(prevRange.startDate, prevRange.endDate)
        : []
    } else {
      currentTransactions = transactions.filter((t) => t.status === 'concluida')
      prevTransactions = [] as typeof transactions
    }

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

    const current = calcStats(currentTransactions)
    const prev = calcStats(prevTransactions)

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
  }, [transactions, selectedPeriod, dateRange, prevRange])

  // Pegar últimas 5 transações
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }, [transactions])

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Welcome Skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-64 bg-neutral-800 rounded-lg animate-pulse" />
          <div className="h-5 w-48 bg-neutral-800/60 rounded animate-pulse" />
        </div>
        {/* Stats Cards Skeleton */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        {/* Charts Skeleton */}
        <div className="grid gap-4 lg:grid-cols-7">
          <div className="lg:col-span-4"><SkeletonChart /></div>
          <div className="lg:col-span-3"><SkeletonChart /></div>
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
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {getGreeting()}, {getFirstName(user?.email)}
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 mt-1">
            Aqui está o resumo das suas finanças
          </p>
        </div>
        <PeriodSelector selected={selectedPeriod} onChange={setSelectedPeriod} showCustom />
      </div>

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

      {/* Charts Row - Asymmetric layout */}
      <div className="grid gap-4 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <FinancialEvolutionChart
            transactions={transactions}
            startDate={dateRange?.startDate}
            endDate={dateRange?.endDate}
          />
        </div>
        <div className="lg:col-span-3">
          <ExpensesByCategoryChart
            transactions={transactions}
            startDate={dateRange?.startDate}
            endDate={dateRange?.endDate}
          />
        </div>
      </div>

      {/* Recent Transactions */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 px-4 sm:px-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg">Transações Recentes</CardTitle>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 sm:mt-1 truncate">
                Últimas movimentações
              </p>
            </div>
            <Link
              href="/transacoes"
              className="flex items-center gap-1.5 text-primary hover:text-primary-400 text-sm font-medium transition-colors flex-shrink-0 group/link"
            >
              <span className="hidden sm:inline">Ver todas</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-4 sm:px-6">
          {recentTransactions.length === 0 ? (
            <EmptyState
              title="Nenhuma transação ainda"
              description="Comece adicionando sua primeira transação para acompanhar suas finanças."
              icon={<Wallet className="h-12 w-12" />}
              action={
                <Link href="/transacoes">
                  <Button>Adicionar Transação</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-1">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-3 px-3 -mx-3 rounded-lg hover:bg-neutral-800/50 transition-colors gap-3 group/item cursor-default"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div
                      className={`flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex-shrink-0 transition-transform duration-200 group-hover/item:scale-105 ${
                        transaction.type === 'receita'
                          ? 'bg-emerald-500/15'
                          : transaction.type === 'investimento'
                          ? 'bg-blue-500/15'
                          : 'bg-red-500/15'
                      }`}
                    >
                      {transaction.type === 'receita' ? (
                        <ArrowDownLeft className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                      ) : transaction.type === 'investimento' ? (
                        <LineChart className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white text-sm sm:text-base truncate">
                        {transaction.description}
                      </p>
                      <p className="text-xs sm:text-sm text-neutral-500 flex items-center gap-1.5 truncate">
                        {transaction.category ? (
                          <>
                            <CategoryIcon icon={transaction.category.icon} size="sm" className="flex-shrink-0" />
                            <span className="truncate">{transaction.category.name}</span>
                          </>
                        ) : (
                          'Sem categoria'
                        )}
                        <span className="hidden sm:inline text-neutral-600">•</span>
                        <span className="hidden sm:inline">{formatDate(transaction.date)}</span>
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm sm:text-base font-semibold flex-shrink-0 tabular-nums ${
                      transaction.type === 'receita'
                        ? 'text-emerald-400'
                        : transaction.type === 'investimento'
                        ? 'text-blue-400'
                        : 'text-red-400'
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
