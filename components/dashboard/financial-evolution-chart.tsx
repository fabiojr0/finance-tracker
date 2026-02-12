'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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

    // Determinar range de meses
    const end = endDate || new Date()
    const start = startDate || new Date(end.getFullYear(), end.getMonth() - 5, 1)

    const startMonth = new Date(start.getFullYear(), start.getMonth(), 1)
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1)

    // Inicializar meses no range
    const current = new Date(startMonth)
    while (current <= endMonth) {
      const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
      months[monthKey] = { receitas: 0, despesas: 0, investimentos: 0 }
      current.setMonth(current.getMonth() + 1)
    }

    // Agregar transações por mês
    transactions.forEach((transaction) => {
      if (transaction.status !== 'concluida') return

      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (months[monthKey]) {
        if (transaction.type === 'receita') {
          months[monthKey].receitas += Number(transaction.amount)
        } else if (transaction.type === 'despesa') {
          months[monthKey].despesas += Number(transaction.amount)
        } else if (transaction.type === 'investimento') {
          months[monthKey].investimentos += Number(transaction.amount)
        }
      }
    })

    // Converter para array e calcular saldo acumulado
    let accumulatedBalance = 0
    return Object.entries(months).map(([key, value]) => {
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
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Evolução Financeira</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {!hasData ? (
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-neutral-800 rounded-lg">
            <div className="text-center">
              <p className="text-neutral-400 text-sm">Nenhum dado para exibir</p>
              <p className="text-xs text-neutral-500 mt-1">
                Adicione transações para visualizar
              </p>
            </div>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#737373"
                  style={{ fontSize: '11px' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#737373"
                  style={{ fontSize: '11px' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    border: '1px solid #404040',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  itemStyle={{
                    color: '#f5f5f5',
                  }}
                  labelStyle={{
                    color: '#a3a3a3',
                    fontWeight: 500,
                  }}
                  formatter={(value) =>
                    typeof value === 'number' ? formatCurrency(value) : 'R$ 0,00'
                  }
                />
                <Area
                  type="monotone"
                  dataKey="Receitas"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorReceitas)"
                />
                <Area
                  type="monotone"
                  dataKey="Despesas"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDespesas)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
