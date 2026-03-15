'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart as PieChartIcon } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { TransactionWithCategory } from '@/types/transaction'
import { formatCurrency } from '@/lib/utils/format-currency'

interface CategoryChartProps {
  transactions: TransactionWithCategory[]
  startDate?: Date
  endDate?: Date
}

const COLORS = [
  '#fb923c', // orange
  '#818cf8', // indigo
  '#f87171', // red
  '#34d399', // emerald
  '#22d3ee', // cyan
  '#c084fc', // purple
  '#f472b6', // pink
  '#fbbf24', // amber
  '#2dd4bf', // teal
  '#60a5fa', // blue
]

export function CategoryChart({ transactions, startDate, endDate }: CategoryChartProps) {
  const chartData = useMemo(() => {
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

      const now = new Date()
      return (
        t.type === 'despesa' &&
        t.status === 'concluida' &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      )
    })

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
      .slice(0, 10)
  }, [transactions, startDate, endDate])

  const hasData = chartData.length > 0
  const total = chartData.reduce((s, d) => s + d.value, 0)

  return (
    <Card>
      <CardHeader className="px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-red-500/15 p-1.5">
            <PieChartIcon className="h-4 w-4 text-red-400" />
          </div>
          <CardTitle className="text-base sm:text-lg">Gastos por Categoria</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {!hasData ? (
          <div className="h-80 flex items-center justify-center border border-dashed border-neutral-800 rounded-xl">
            <div className="text-center">
              <div className="mx-auto mb-3 rounded-full bg-neutral-800/60 p-3 w-fit">
                <PieChartIcon className="h-6 w-6 text-neutral-500" />
              </div>
              <p className="text-neutral-400 text-sm font-medium">Nenhum dado para exibir</p>
              <p className="text-xs text-neutral-500 mt-1">
                Adicione despesas para visualizar o gráfico
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="h-80 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
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
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                      padding: '12px',
                    }}
                    itemStyle={{ color: '#e5e5e5' }}
                    labelStyle={{ color: '#a3a3a3', fontWeight: 600 }}
                    formatter={(value) =>
                      typeof value === 'number' ? formatCurrency(value) : 'R$ 0,00'
                    }
                  />
                  <text
                    x="50%"
                    y="46%"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-neutral-400"
                    style={{ fontSize: '12px' }}
                  >
                    Total
                  </text>
                  <text
                    x="50%"
                    y="56%"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-white"
                    style={{ fontSize: '14px', fontWeight: 700 }}
                  >
                    {formatCurrency(total)}
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category breakdown with progress bars */}
            <div className="lg:w-72 space-y-2.5 flex flex-col justify-center">
              {chartData.map((item, index) => {
                const percentage = total > 0 ? (item.value / total) * 100 : 0
                const color = item.color || COLORS[index % COLORS.length]
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neutral-300 truncate mr-2">{item.name}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-medium text-neutral-300">{formatCurrency(item.value)}</span>
                        <span className="text-[10px] text-neutral-500 w-8 text-right">{percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%`, backgroundColor: color, opacity: 0.8 }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
