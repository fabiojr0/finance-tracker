// AI-report-area translations (pt-BR, en, es).
// `pt` is the reference shape; `en` and `es` are enforced to match it.
// Only ai-report-unique strings live here. Reuse t.common.* and the central
// dictionary for shared strings.

const pt = {
  // Page header
  title: 'Relatório com IA',
  subtitle:
    'Escolha um período e gere uma análise inteligente das suas finanças, baseada nas transações, valores e categorias.',

  // Period card
  analysisPeriod: 'Período de análise',
  startDate: 'Data inicial',
  endDate: 'Data final',
  additionalInstructions: 'Instruções adicionais (opcional)',
  promptPlaceholder:
    'Ex.: foque nos gastos com alimentação, ou compare com o mês anterior.',
  charactersCount: 'caracteres',
  periodNotDefined: 'Período não definido',
  analyzing: 'Analisando...',
  generateReport: 'Gerar relatório',

  // Loading state
  loadingTitle: 'A IA está analisando suas transações',
  loadingDescription:
    'Estamos consolidando suas receitas, despesas, investimentos e categorias para gerar uma análise personalizada. Isso pode levar alguns segundos.',

  // Error state
  errorTitle: 'Não foi possível gerar o relatório',

  // Report result section labels
  summaryLabel: 'Resumo',
  highlightsLabel: 'Destaques',
  topCategoriesLabel: 'Categorias principais',
  attentionPointsLabel: 'Pontos de atenção',
  recommendationsLabel: 'Recomendações',

  // Summary stats
  income: 'Receitas',
  expenses: 'Despesas',
  investments: 'Investimentos',
  balance: 'Saldo',

  // Summary badges
  transactionsCount: 'transações',
  savingsRate: 'Taxa de poupança',

  // Report header / metadata
  closeReport: 'Fechar relatório',
  generatedAt: 'Gerado em',
  rangeSeparator: 'a',

  // Saved reports
  savedReports: 'Relatórios salvos',
  savedReportSingular: 'relatório',
  savedReportPlural: 'relatórios',
  noSavedReports: 'Nenhum relatório salvo ainda. Gere o primeiro acima.',
  custom: 'Personalizado',
  viewing: 'Visualizando',
  view: 'Visualizar',

  // Period labels
  periodAll: 'Todos os períodos',
  periodCustom: 'Personalizado',
  periodThisMonth: 'Este mês',
  periodLastMonth: 'Mês anterior',
  periodLast3Months: 'Últimos 3 meses',
  periodLast6Months: 'Últimos 6 meses',
  periodLast12Months: 'Últimos 12 meses',
  periodThisYear: 'Este ano',

  // Delete confirmation
  deleteTitle: 'Excluir relatório?',
  deleteConfirmLabel: 'Excluir',
  deletePrefix: 'O relatório de',
  deleteSuffix: 'será removido permanentemente.',

  // Toast / error messages
  selectValidPeriod: 'Selecione um período válido',
  startBeforeEnd: 'A data inicial deve ser anterior à final',
  generateError: 'Erro ao gerar relatório',
  reportGenerated: 'Relatório gerado e salvo!',
  serverError: 'Falha ao se comunicar com o servidor.',
  loadSavedError: 'Erro ao carregar relatórios salvos',
  loadSavedFailed: 'Falha ao carregar relatórios salvos',
  openError: 'Erro ao abrir relatório',
  openFailed: 'Falha ao abrir relatório',
  deleteError: 'Erro ao excluir relatório',
  reportDeleted: 'Relatório excluído',
  deleteFailed: 'Falha ao excluir relatório',
} as const

type Section = { [K in keyof typeof pt]: string }

const en: Section = {
  title: 'AI Report',
  subtitle:
    'Choose a period and generate a smart analysis of your finances, based on your transactions, amounts and categories.',

  analysisPeriod: 'Analysis period',
  startDate: 'Start date',
  endDate: 'End date',
  additionalInstructions: 'Additional instructions (optional)',
  promptPlaceholder:
    'E.g.: focus on food spending, or compare with the previous month.',
  charactersCount: 'characters',
  periodNotDefined: 'Period not defined',
  analyzing: 'Analyzing...',
  generateReport: 'Generate report',

  loadingTitle: 'The AI is analyzing your transactions',
  loadingDescription:
    'We are consolidating your income, expenses, investments and categories to generate a personalized analysis. This may take a few seconds.',

  errorTitle: 'Could not generate the report',

  summaryLabel: 'Summary',
  highlightsLabel: 'Highlights',
  topCategoriesLabel: 'Top categories',
  attentionPointsLabel: 'Points of attention',
  recommendationsLabel: 'Recommendations',

  income: 'Income',
  expenses: 'Expenses',
  investments: 'Investments',
  balance: 'Balance',

  transactionsCount: 'transactions',
  savingsRate: 'Savings rate',

  closeReport: 'Close report',
  generatedAt: 'Generated on',
  rangeSeparator: 'to',

  savedReports: 'Saved reports',
  savedReportSingular: 'report',
  savedReportPlural: 'reports',
  noSavedReports: 'No saved reports yet. Generate the first one above.',
  custom: 'Custom',
  viewing: 'Viewing',
  view: 'View',

  periodAll: 'All periods',
  periodCustom: 'Custom',
  periodThisMonth: 'This month',
  periodLastMonth: 'Last month',
  periodLast3Months: 'Last 3 months',
  periodLast6Months: 'Last 6 months',
  periodLast12Months: 'Last 12 months',
  periodThisYear: 'This year',

  deleteTitle: 'Delete report?',
  deleteConfirmLabel: 'Delete',
  deletePrefix: 'The report from',
  deleteSuffix: 'will be permanently removed.',

  selectValidPeriod: 'Select a valid period',
  startBeforeEnd: 'The start date must be before the end date',
  generateError: 'Error generating report',
  reportGenerated: 'Report generated and saved!',
  serverError: 'Failed to communicate with the server.',
  loadSavedError: 'Error loading saved reports',
  loadSavedFailed: 'Failed to load saved reports',
  openError: 'Error opening report',
  openFailed: 'Failed to open report',
  deleteError: 'Error deleting report',
  reportDeleted: 'Report deleted',
  deleteFailed: 'Failed to delete report',
}

const es: Section = {
  title: 'Informe con IA',
  subtitle:
    'Elige un período y genera un análisis inteligente de tus finanzas, basado en tus transacciones, importes y categorías.',

  analysisPeriod: 'Período de análisis',
  startDate: 'Fecha inicial',
  endDate: 'Fecha final',
  additionalInstructions: 'Instrucciones adicionales (opcional)',
  promptPlaceholder:
    'Ej.: enfócate en los gastos de alimentación, o compara con el mes anterior.',
  charactersCount: 'caracteres',
  periodNotDefined: 'Período no definido',
  analyzing: 'Analizando...',
  generateReport: 'Generar informe',

  loadingTitle: 'La IA está analizando tus transacciones',
  loadingDescription:
    'Estamos consolidando tus ingresos, gastos, inversiones y categorías para generar un análisis personalizado. Esto puede tardar unos segundos.',

  errorTitle: 'No se pudo generar el informe',

  summaryLabel: 'Resumen',
  highlightsLabel: 'Destacados',
  topCategoriesLabel: 'Categorías principales',
  attentionPointsLabel: 'Puntos de atención',
  recommendationsLabel: 'Recomendaciones',

  income: 'Ingresos',
  expenses: 'Gastos',
  investments: 'Inversiones',
  balance: 'Saldo',

  transactionsCount: 'transacciones',
  savingsRate: 'Tasa de ahorro',

  closeReport: 'Cerrar informe',
  generatedAt: 'Generado el',
  rangeSeparator: 'a',

  savedReports: 'Informes guardados',
  savedReportSingular: 'informe',
  savedReportPlural: 'informes',
  noSavedReports: 'Aún no hay informes guardados. Genera el primero arriba.',
  custom: 'Personalizado',
  viewing: 'Visualizando',
  view: 'Ver',

  periodAll: 'Todos los períodos',
  periodCustom: 'Personalizado',
  periodThisMonth: 'Este mes',
  periodLastMonth: 'Mes anterior',
  periodLast3Months: 'Últimos 3 meses',
  periodLast6Months: 'Últimos 6 meses',
  periodLast12Months: 'Últimos 12 meses',
  periodThisYear: 'Este año',

  deleteTitle: '¿Eliminar informe?',
  deleteConfirmLabel: 'Eliminar',
  deletePrefix: 'El informe de',
  deleteSuffix: 'será eliminado permanentemente.',

  selectValidPeriod: 'Selecciona un período válido',
  startBeforeEnd: 'La fecha inicial debe ser anterior a la final',
  generateError: 'Error al generar el informe',
  reportGenerated: '¡Informe generado y guardado!',
  serverError: 'Error al comunicarse con el servidor.',
  loadSavedError: 'Error al cargar los informes guardados',
  loadSavedFailed: 'Error al cargar los informes guardados',
  openError: 'Error al abrir el informe',
  openFailed: 'Error al abrir el informe',
  deleteError: 'Error al eliminar el informe',
  reportDeleted: 'Informe eliminado',
  deleteFailed: 'Error al eliminar el informe',
}

export const aiReportDict = { pt, en, es }
