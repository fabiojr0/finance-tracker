'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TransactionWithCategory } from '@/types/transaction'
import { formatCurrency } from '@/lib/utils/format-currency'

interface TrendChartProps {
  transactions: TransactionWithCategory[]
  startDate?: Date
  endDate?: Date
}

export function TrendChart({ transactions, startDate, endDate }: TrendChartProps) {
  const chartData = useMemo(() => {
    const months: { [key: string]: { receitas: number; despesas: number; saldo: number } } = {}

    // Determinar range de meses
    const end = endDate || new Date()
    const start = startDate || new Date(end.getFullYear(), end.getMonth() - 11, 1)

    const startMonth = new Date(start.getFullYear(), start.getMonth(), 1)
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1)

    // Inicializar meses no range
    const current = new Date(startMonth)
    while (current <= endMonth) {
      const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
      months[monthKey] = { receitas: 0, despesas: 0, saldo: 0 }
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
        }
      }
    })

    // Calcular saldo acumulado
    let saldoAcumulado = 0
    return Object.entries(months).map(([key, value]) => {
      const [year, month] = key.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, 1)
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })

      saldoAcumulado += value.receitas - value.despesas

      return {
        name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        Receitas: value.receitas,
        Despesas: value.despesas,
        Saldo: saldoAcumulado,
      }
    })
  }, [transactions, startDate, endDate])

  const hasData = chartData.some((data) => data.Receitas > 0 || data.Despesas > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução Financeira</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-80 flex items-center justify-center border-2 border-dashed border-neutral-800 rounded-lg">
            <div className="text-center">
              <p className="text-neutral-400">Nenhum dado para exibir</p>
              <p className="text-sm text-neutral-500 mt-1">
                Adicione transações para visualizar o gráfico
              </p>
            </div>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis
                  dataKey="name"
                  stroke="#a3a3a3"
                  style={{ fontSize: '11px' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  stroke="#a3a3a3"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
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
                <Legend
                  wrapperStyle={{ color: '#f5f5f5' }}
                  iconType="line"
                />
                <Line
                  type="monotone"
                  dataKey="Receitas"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Despesas"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Saldo"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
