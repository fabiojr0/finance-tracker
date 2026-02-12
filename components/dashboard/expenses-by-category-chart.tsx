'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
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
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Gastos por Categoria</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {!hasData ? (
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-neutral-800 rounded-lg">
            <div className="text-center">
              <p className="text-neutral-400 text-sm">Nenhuma despesa neste período</p>
              <p className="text-xs text-neutral-500 mt-1">
                Adicione despesas para visualizar
              </p>
            </div>
          </div>
        ) : (
          <div className="h-64 flex gap-4">
            {/* Pie Chart */}
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
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
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="w-1/2 flex flex-col justify-center gap-2 overflow-y-auto">
              {chartData.map((item, index) => {
                const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0
                return (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
                    />
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <CategoryIcon icon={item.icon} size="sm" className="flex-shrink-0 text-neutral-400" />
                      <span className="text-xs text-neutral-300 truncate">{item.name}</span>
                    </div>
                    <span className="text-xs text-neutral-500 flex-shrink-0">{percentage}%</span>
                  </div>
                )
              })}
              <div className="pt-2 mt-2 border-t border-neutral-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-400">Total</span>
                  <span className="text-sm font-semibold text-white">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
