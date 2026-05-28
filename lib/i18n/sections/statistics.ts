// i18n section for the Statistics area (page + reports charts + shared
// PeriodSelector). `pt` is the reference shape; `en`/`es` must match it
// (enforced by the `Section` type). Reused global keys (common.*,
// transactionTypes.*, transactionStatus.*, nav.*) live in dictionaries.ts and
// must NOT be duplicated here.

const pt = {
  // Page heading
  title: 'Estatísticas',
  subtitle: 'Análises e gráficos das suas finanças',

  // Summary stat cards
  monthlyAverage: 'Média mensal',

  // Chart titles
  categoryChartTitle: 'Gastos por Categoria',
  trendChartTitle: 'Evolução Financeira',
  monthlyChartTitle: 'Visão Mensal',

  // Trend chart legends / series labels
  legendIncome: 'Receitas',
  legendExpenses: 'Despesas',
  legendBalance: 'Saldo',

  // Pie chart center label
  total: 'Total',

  // Empty states
  noData: 'Nenhum dado para exibir',
  addTransactionsHint: 'Adicione transações para visualizar o gráfico',
  addExpensesHint: 'Adicione despesas para visualizar o gráfico',

  // PeriodSelector preset option labels (full + short)
  periodThisMonth: 'Este mês',
  periodThisMonthShort: 'Este mês',
  periodLastMonth: 'Mês anterior',
  periodLastMonthShort: 'Mês ant.',
  periodLast3Months: 'Últimos 3 meses',
  periodLast3MonthsShort: '3 meses',
  periodLast6Months: 'Últimos 6 meses',
  periodLast6MonthsShort: '6 meses',
  periodLast12Months: 'Últimos 12 meses',
  periodLast12MonthsShort: '12 meses',
  periodThisYear: 'Este ano',
  periodThisYearShort: 'Este ano',
  periodAll: 'Todos',
  periodAllShort: 'Todos',
  periodCustom: 'Personalizado',
  periodCustomShort: 'Person.',
} as const

type Section = { [K in keyof typeof pt]: string }

const en: Section = {
  title: 'Statistics',
  subtitle: 'Analytics and charts of your finances',

  monthlyAverage: 'Monthly average',

  categoryChartTitle: 'Spending by Category',
  trendChartTitle: 'Financial Trend',
  monthlyChartTitle: 'Monthly Overview',

  legendIncome: 'Income',
  legendExpenses: 'Expenses',
  legendBalance: 'Balance',

  total: 'Total',

  noData: 'No data to display',
  addTransactionsHint: 'Add transactions to view the chart',
  addExpensesHint: 'Add expenses to view the chart',

  periodThisMonth: 'This month',
  periodThisMonthShort: 'This month',
  periodLastMonth: 'Last month',
  periodLastMonthShort: 'Last mo.',
  periodLast3Months: 'Last 3 months',
  periodLast3MonthsShort: '3 months',
  periodLast6Months: 'Last 6 months',
  periodLast6MonthsShort: '6 months',
  periodLast12Months: 'Last 12 months',
  periodLast12MonthsShort: '12 months',
  periodThisYear: 'This year',
  periodThisYearShort: 'This year',
  periodAll: 'All',
  periodAllShort: 'All',
  periodCustom: 'Custom',
  periodCustomShort: 'Custom',
}

const es: Section = {
  title: 'Estadísticas',
  subtitle: 'Análisis y gráficos de tus finanzas',

  monthlyAverage: 'Promedio mensual',

  categoryChartTitle: 'Gastos por Categoría',
  trendChartTitle: 'Evolución Financiera',
  monthlyChartTitle: 'Vista Mensual',

  legendIncome: 'Ingresos',
  legendExpenses: 'Gastos',
  legendBalance: 'Saldo',

  total: 'Total',

  noData: 'No hay datos para mostrar',
  addTransactionsHint: 'Añade transacciones para ver el gráfico',
  addExpensesHint: 'Añade gastos para ver el gráfico',

  periodThisMonth: 'Este mes',
  periodThisMonthShort: 'Este mes',
  periodLastMonth: 'Mes anterior',
  periodLastMonthShort: 'Mes ant.',
  periodLast3Months: 'Últimos 3 meses',
  periodLast3MonthsShort: '3 meses',
  periodLast6Months: 'Últimos 6 meses',
  periodLast6MonthsShort: '6 meses',
  periodLast12Months: 'Últimos 12 meses',
  periodLast12MonthsShort: '12 meses',
  periodThisYear: 'Este año',
  periodThisYearShort: 'Este año',
  periodAll: 'Todos',
  periodAllShort: 'Todos',
  periodCustom: 'Personalizado',
  periodCustomShort: 'Person.',
}

export const statisticsDict = { pt, en, es }
