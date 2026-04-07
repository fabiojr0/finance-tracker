'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { TransactionWithCategory } from '@/types/transaction'
import { formatCurrency } from '@/lib/utils/format-currency'

interface FinancialEvolutionChartProps {
  transactions: TransactionWithCategory[]
  startDate?: Date
  endDate?: Date
}

export function FinancialEvolutionChart({ transactions, startDate, endDate }: FinancialEvolutionChartProps) {
  const chartData = useMemo(() => {
    const months: { [key: string]: { receitas: number; despesas: number; investimentos: number } } = {}

    if (startDate && endDate) {
      // Modo com range: inicializar todos os meses no intervalo
      const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
      const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
      while (current <= endMonth) {
        const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
        months[monthKey] = { receitas: 0, despesas: 0, investimentos: 0 }
        current.setMonth(current.getMonth() + 1)
      }
    }

    // Agregar transações concluídas por mês
    transactions.forEach((transaction) => {
      if (transaction.status !== 'concluida') return

      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (startDate && endDate) {
        if (date < startDate || date > endDate) return
      }

      if (!months[monthKey]) {
        months[monthKey] = { receitas: 0, despesas: 0, investimentos: 0 }
      }

      if (transaction.type === 'receita') {
        months[monthKey].receitas += Number(transaction.amount)
      } else if (transaction.type === 'despesa') {
        months[monthKey].despesas += Number(transaction.amount)
      } else if (transaction.type === 'investimento') {
        months[monthKey].investimentos += Number(transaction.amount)
      }
    })

    // Se sem range, pegar últimos 12 meses com transações
    const sortedKeys = startDate && endDate
      ? Object.keys(months).sort()
      : Object.keys(months).sort().slice(-12)

    // Converter para array e calcular saldo acumulado
    let accumulatedBalance = 0
    return sortedKeys.map((key) => {
      const value = months[key]
      const [year, month] = key.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, 1)
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' })

      const monthBalance = value.receitas - value.despesas - value.investimentos
      accumulatedBalance += monthBalance

      return {
        name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        Receitas: value.receitas,
        Despesas: value.despesas,
        Saldo: accumulatedBalance,
      }
    })
  }, [transactions, startDate, endDate])

  const hasData = chartData.some((data) => data.Receitas > 0 || data.Despesas > 0)

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-emerald-500/15 p-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <CardTitle className="text-base">Evolução Financeira</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-2 sm:px-6">
        {!hasData ? (
          <div className="h-72 flex items-center justify-center border border-dashed border-neutral-800 rounded-xl">
            <div className="text-center">
              <div className="mx-auto mb-3 rounded-full bg-neutral-800/60 p-3 w-fit">
                <TrendingUp className="h-6 w-6 text-neutral-500" />
              </div>
              <p className="text-neutral-400 text-sm font-medium">Nenhum dado para exibir</p>
              <p className="text-xs text-neutral-500 mt-1">
                Adicione transações para visualizar
              </p>
            </div>
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f87171" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#525252"
                  style={{ fontSize: '11px' }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  stroke="#525252"
                  style={{ fontSize: '11px' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  axisLine={false}
                  tickLine={false}
                  dx={-4}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    padding: '12px',
                  }}
                  itemStyle={{
                    color: '#e5e5e5',
                    padding: '2px 0',
                  }}
                  labelStyle={{
                    color: '#a3a3a3',
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}
                  formatter={(value) =>
                    typeof value === 'number' ? formatCurrency(value) : 'R$ 0,00'
                  }
                  cursor={{ stroke: '#525252', strokeDasharray: '4 4' }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                  formatter={(value) => (
                    <span style={{ color: '#a3a3a3' }}>{value}</span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="Receitas"
                  stroke="#34d399"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorReceitas)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#34d399', stroke: '#171717', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="Despesas"
                  stroke="#f87171"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorDespesas)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#f87171', stroke: '#171717', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
