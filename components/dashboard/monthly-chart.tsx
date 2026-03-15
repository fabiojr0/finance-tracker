'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TransactionWithCategory } from '@/types/transaction'
import { formatCurrency } from '@/lib/utils/format-currency'

interface MonthlyChartProps {
  transactions: TransactionWithCategory[]
  startDate?: Date
  endDate?: Date
}

export function MonthlyChart({ transactions, startDate, endDate }: MonthlyChartProps) {
  const chartData = useMemo(() => {
    const months: { [key: string]: { receitas: number; despesas: number } } = {}

    const end = endDate || new Date()
    const start = startDate || new Date(end.getFullYear(), end.getMonth() - 5, 1)

    const startMonth = new Date(start.getFullYear(), start.getMonth(), 1)
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1)

    const current = new Date(startMonth)
    while (current <= endMonth) {
      const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
      months[monthKey] = { receitas: 0, despesas: 0 }
      current.setMonth(current.getMonth() + 1)
    }

    transactions.forEach((transaction) => {
      if (transaction.status !== 'concluida') return

      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (months[monthKey]) {
        if (transaction.type === 'receita') {
          months[monthKey].receitas += Number(transaction.amount)
        } else if (transaction.type === 'despesa') {
          months[monthKey].despesas += Number(transaction.amount)
        }
      }
    })

    return Object.entries(months).map(([key, value]) => {
      const [year, month] = key.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, 1)
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' })

      return {
        name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        Receitas: value.receitas,
        Despesas: value.despesas,
      }
    })
  }, [transactions, startDate, endDate])

  const hasData = chartData.some((data) => data.Receitas > 0 || data.Despesas > 0)

  return (
    <Card>
      <CardHeader className="px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-500/15 p-1.5">
            <BarChart3 className="h-4 w-4 text-blue-400" />
          </div>
          <CardTitle className="text-base sm:text-lg">Visão Mensal</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {!hasData ? (
          <div className="h-80 flex items-center justify-center border border-dashed border-neutral-800 rounded-xl">
            <div className="text-center">
              <div className="mx-auto mb-3 rounded-full bg-neutral-800/60 p-3 w-fit">
                <BarChart3 className="h-6 w-6 text-neutral-500" />
              </div>
              <p className="text-neutral-400 text-sm font-medium">Nenhum dado para exibir</p>
              <p className="text-xs text-neutral-500 mt-1">
                Adicione transações para visualizar o gráfico
              </p>
            </div>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
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
                  itemStyle={{ color: '#e5e5e5', padding: '2px 0' }}
                  labelStyle={{ color: '#a3a3a3', fontWeight: 600, marginBottom: '4px' }}
                  formatter={(value) =>
                    typeof value === 'number' ? formatCurrency(value) : 'R$ 0,00'
                  }
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                  formatter={(value) => (
                    <span style={{ color: '#a3a3a3' }}>{value}</span>
                  )}
                />
                <Bar dataKey="Receitas" fill="#34d399" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Despesas" fill="#f87171" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
