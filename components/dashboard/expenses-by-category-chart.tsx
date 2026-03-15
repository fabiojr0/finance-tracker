'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart as PieChartIcon } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { TransactionWithCategory } from '@/types/transaction'
import { formatCurrency } from '@/lib/utils/format-currency'
import { CategoryIcon } from '@/components/shared/category-icon'

interface ExpensesByCategoryChartProps {
  transactions: TransactionWithCategory[]
  startDate?: Date
  endDate?: Date
}

const COLORS = [
  '#f87171', // red
  '#fb923c', // orange
  '#fbbf24', // yellow
  '#34d399', // emerald
  '#22d3ee', // cyan
  '#818cf8', // indigo
  '#c084fc', // purple
  '#f472b6', // pink
]

export function ExpensesByCategoryChart({ transactions, startDate, endDate }: ExpensesByCategoryChartProps) {
  const { chartData, total } = useMemo(() => {
    // Filtrar apenas despesas do período
    const currentMonthExpenses = transactions.filter((t) => {
      const transactionDate = new Date(t.date)

      if (startDate && endDate) {
        return (
          transactionDate >= startDate &&
          transactionDate <= endDate &&
          t.type === 'despesa' &&
          t.status === 'concluida'
        )
      }

      // Fallback: mês atual
      const now = new Date()
      return (
        transactionDate.getMonth() === now.getMonth() &&
        transactionDate.getFullYear() === now.getFullYear() &&
        t.type === 'despesa' &&
        t.status === 'concluida'
      )
    })

    // Agrupar por categoria
    const categoryMap: { [key: string]: { name: string; value: number; icon: string | null; color: string | null } } = {}

    currentMonthExpenses.forEach((transaction) => {
      const categoryName = transaction.category?.name || 'Sem categoria'
      const categoryIcon = transaction.category?.icon || null
      const categoryColor = transaction.category?.color || null

      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = {
          name: categoryName,
          value: 0,
          icon: categoryIcon,
          color: categoryColor,
        }
      }
      categoryMap[categoryName].value += Number(transaction.amount)
    })

    // Converter para array e ordenar por valor
    const data = Object.values(categoryMap)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6) // Top 6 categorias

    const totalAmount = data.reduce((sum, item) => sum + item.value, 0)

    return { chartData: data, total: totalAmount }
  }, [transactions, startDate, endDate])

  const hasData = chartData.length > 0

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-red-500/15 p-1.5">
            <PieChartIcon className="h-4 w-4 text-red-400" />
          </div>
          <CardTitle className="text-base">Gastos por Categoria</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-4 sm:px-6">
        {!hasData ? (
          <div className="h-72 flex items-center justify-center border border-dashed border-neutral-800 rounded-xl">
            <div className="text-center">
              <div className="mx-auto mb-3 rounded-full bg-neutral-800/60 p-3 w-fit">
                <PieChartIcon className="h-6 w-6 text-neutral-500" />
              </div>
              <p className="text-neutral-400 text-sm font-medium">Nenhuma despesa neste período</p>
              <p className="text-xs text-neutral-500 mt-1">
                Adicione despesas para visualizar
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pie Chart */}
            <div className="h-44 sm:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
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
                    itemStyle={{
                      color: '#e5e5e5',
                    }}
                    labelStyle={{
                      color: '#a3a3a3',
                      fontWeight: 600,
                    }}
                    formatter={(value) =>
                      typeof value === 'number' ? formatCurrency(value) : 'R$ 0,00'
                    }
                  />
                  {/* Center label */}
                  <text
                    x="50%"
                    y="46%"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-neutral-400"
                    style={{ fontSize: '11px' }}
                  >
                    Total
                  </text>
                  <text
                    x="50%"
                    y="56%"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-white"
                    style={{ fontSize: '13px', fontWeight: 700 }}
                  >
                    {formatCurrency(total)}
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category list with progress bars */}
            <div className="space-y-2.5">
              {chartData.map((item, index) => {
                const percentage = total > 0 ? (item.value / total) * 100 : 0
                const color = item.color || COLORS[index % COLORS.length]
                return (
                  <div key={item.name} className="group/cat">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <CategoryIcon icon={item.icon} size="sm" className="flex-shrink-0 text-neutral-400" />
                        <span className="text-xs text-neutral-300 truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-medium text-neutral-300">{formatCurrency(item.value)}</span>
                        <span className="text-[10px] text-neutral-500 w-8 text-right">{percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: color,
                          opacity: 0.8,
                        }}
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
