// Calendar-area translations (pt-BR, en, es).
// `pt` is the reference shape; `en` and `es` are enforced to match it.
// Only calendar-unique strings live here. Reuse t.common.*, t.transactionTypes.*
// and t.transactionStatus.* from the central dictionary for shared strings.
// NOTE: Month and weekday names are NOT stored here — they are derived from the
// active locale (localeTag) via Intl in the components.

const pt = {
  // Page header
  title: 'Calendário',
  subtitle: 'Visualize todas as suas transações organizadas por data',
  importStatement: 'Importar Extrato',

  // View toggle + navigation
  viewYear: 'Ano',
  viewMonth: 'Mês',
  viewWeek: 'Semana',
  today: 'Hoje',

  // Day cell
  noTransactions: 'Sem transações',
  viewDayTransactions: 'Ver transações do dia',
  incomeLabel: 'Receitas',
  expensesLabel: 'Despesas',
  more: 'mais',

  // Day modal
  noTransactionsThisDay: 'Nenhuma transação neste dia',
  addTransaction: 'Adicionar Transação',
  noCategory: 'Sem categoria',
} as const

type Section = { [K in keyof typeof pt]: string }

const en: Section = {
  title: 'Calendar',
  subtitle: 'View all your transactions organized by date',
  importStatement: 'Import Statement',

  viewYear: 'Year',
  viewMonth: 'Month',
  viewWeek: 'Week',
  today: 'Today',

  noTransactions: 'No transactions',
  viewDayTransactions: 'View transactions for the day',
  incomeLabel: 'Income',
  expensesLabel: 'Expenses',
  more: 'more',

  noTransactionsThisDay: 'No transactions on this day',
  addTransaction: 'Add Transaction',
  noCategory: 'No category',
}

const es: Section = {
  title: 'Calendario',
  subtitle: 'Visualiza todas tus transacciones organizadas por fecha',
  importStatement: 'Importar Extracto',

  viewYear: 'Año',
  viewMonth: 'Mes',
  viewWeek: 'Semana',
  today: 'Hoy',

  noTransactions: 'Sin transacciones',
  viewDayTransactions: 'Ver transacciones del día',
  incomeLabel: 'Ingresos',
  expensesLabel: 'Gastos',
  more: 'más',

  noTransactionsThisDay: 'Ninguna transacción este día',
  addTransaction: 'Añadir Transacción',
  noCategory: 'Sin categoría',
}

export const calendarDict = { pt, en, es }
