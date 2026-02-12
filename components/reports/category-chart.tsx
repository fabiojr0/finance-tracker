'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { TransactionWithCategory } from '@/types/transaction'
import { formatCurrency } from '@/lib/utils/format-currency'

interface CategoryChartProps {
  transactions: TransactionWithCategory[]
  startDate?: Date
  endDate?: Date
}

const COLORS = [
  '#f97316', // orange
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ef4444', // red
  '#ec4899', // pink
  '#10b981', // green
  '#6b7280', // gray
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#06b6d4', // cyan
]

export function CategoryChart({ transactions, startDate, endDate }: CategoryChartProps) {
  const chartData = useMemo(() => {
    // Filtrar despesas do período
    const expenses = transactions.filter((t) => {
      const date = new Date(t.date)

      if (startDate && endDate) {
        return (
          t.type === 'despesa' &&
          t.status === 'concluida' &&
          date >= startDate &&
          date <= endDate
        )
      }

      // Fallback: mês atual
      const now = new Date()
      return (
        t.type === 'despesa' &&
        t.status === 'concluida' &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      )
    })

    // Agrupar por categoria
    const categoryMap = new Map<string, { name: string; value: number; color: string }>()

    expenses.forEach((transaction) => {
      if (!transaction.category) return

      const categoryId = transaction.category.id
      const existing = categoryMap.get(categoryId)

      if (existing) {
        existing.value += Number(transaction.amount)
      } else {
        categoryMap.set(categoryId, {
          name: transaction.category.name,
          value: Number(transaction.amount),
          color: transaction.category.color || '#f97316',
        })
      }
    })

    return Array.from(categoryMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // Top 10 categorias
  }, [transactions, startDate, endDate])

  const hasData = chartData.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-80 flex items-center justify-center border-2 border-dashed border-neutral-800 rounded-lg">
            <div className="text-center">
              <p className="text-neutral-400">Nenhum dado para exibir</p>
              <p className="text-sm text-neutral-500 mt-1">
                Adicione despesas para visualizar o gráfico
              </p>
            </div>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
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
                  iconType="circle"
                  formatter={(value) => <span style={{ color: '#f5f5f5' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
