// Payments-area translations (pt-BR, en, es).
// `pt` is the reference shape; `en` and `es` are enforced to match it.
// Only payments-unique strings live here. Reuse t.common.*,
// t.transactionTypes.* and the central dictionary for shared strings.

const pt = {
  // Page header
  title: 'Assistente de Pagamentos',
  subtitle:
    'Acompanhe contas a pagar, recorrências e marque o que já foi pago.',
  suggestWithAI: 'Sugerir com IA',
  ai: 'IA',
  newPayment: 'Novo pagamento',
  newShort: 'Novo',

  // Stat cards
  statToPay: 'A pagar',
  statOverdue: 'Vencidos',
  statNext7Days: 'Próximos 7 dias',
  statPaidPeriod: 'Pagos (período)',
  itemsCount: 'item(ns)',

  // Section headers
  pending: 'Pendentes',
  paid: 'Pagos',

  // Empty states
  allUpToDateTitle: 'Tudo em dia!',
  allUpToDateDescription:
    'Nenhum pagamento pendente. Use o botão acima para agendar ou pedir sugestões à IA.',
  noPaidTitle: 'Nenhum pagamento concluído no período',
  noPaidDescription:
    'Marque pagamentos como pagos para acompanhar o histórico.',

  // Payment row badges / labels
  dueOn: 'Vence',
  dueToday: 'Vence hoje',
  dueInOneDay: 'Vence em 1 dia',
  dueInDays: 'Vence em {n} dias',
  overdueOn: 'Venceu {date}',
  recurring: 'Recorrente',
  occurrences: 'ocorrências',
  recurringSeries: 'Série recorrente',
  deleteFullSeries: 'Excluir série completa',

  // Action button titles
  markAsPaid: 'Marcar como pago',
  markAsPending: 'Marcar como pendente',
  editAction: 'Editar',
  deleteAction: 'Excluir',

  // Toast messages
  markedAsPaid: 'Pagamento marcado como pago',
  markedAsPending: 'Pagamento marcado como pendente',
  paymentDeleted: 'Pagamento excluído',
  paymentUpdated: 'Pagamento atualizado',
  paymentScheduled: 'Pagamento agendado',
  paymentsScheduled: '{n} pagamentos agendados',
  occurrencesDeleted: '{n} ocorrência(s) excluída(s)',

  // Delete confirmations
  deletePaymentTitle: 'Excluir pagamento?',
  deletePaymentConfirm: 'Excluir',
  deletePaymentSuffix: 'será removido. Esta ação não pode ser desfeita.',
  deleteSeriesTitle: 'Excluir série completa?',
  deleteSeriesPrefix: 'Todas as ocorrências de',
  deleteSeriesSuffix: 'serão removidas. Esta ação não pode ser desfeita.',
  deleteSeriesConfirm: 'Excluir tudo',

  // Modal titles
  editPaymentTitle: 'Editar Pagamento',
  newPaymentTitle: 'Novo Pagamento Agendado',

  // Form labels
  type: 'Tipo',
  description: 'Descrição',
  descriptionPlaceholder: 'Ex: Aluguel, Internet, Netflix',
  amount: 'Valor',
  amountPlaceholder: '0,00',
  dueDate: 'Vencimento',
  category: 'Categoria',
  categoryPlaceholder: 'Selecione',
  recurrence: 'Recorrência',
  notes: 'Observações',
  notesOptional: '(opcional)',
  notesPlaceholder: 'Detalhes adicionais...',

  // Recurrence options
  recurrenceOnce: 'Uma vez',
  recurrenceMonthly: 'Mensal',
  recurrenceWeekly: 'Semanal',
  recurrenceYearly: 'Anual',

  // Duration
  fixedQuantity: 'Quantidade fixa',
  indefinite: 'Indefinida',
  occurrencesLabel: 'Ocorrências',
  indefiniteHint:
    'Serão geradas várias ocorrências futuras automaticamente (5 anos para mensal, 2 anos para semanal, 30 anos para anual). Você poderá excluir a série a qualquer momento.',

  // Form validation
  descriptionMin: 'Descrição deve ter no mínimo 3 caracteres',
  descriptionMax: 'Descrição deve ter no máximo 255 caracteres',
  amountRequired: 'Informe um valor',
  amountPositive: 'Valor deve ser positivo',
  dueDateRequired: 'Data de vencimento é obrigatória',
  quantityRequired: 'Informe a quantidade',
  quantityMin: 'Mínimo 1',
  quantityMax: 'Máximo 360',

  // AI suggestions modal
  aiSuggestionsTitle: 'Sugestões com IA',
  aiSuggestionsIntro:
    'A IA analisa as transações concluídas do período escolhido e sugere pagamentos recorrentes e contas fixas que podem ser agendadas.',
  rangeStart: 'Início',
  rangeEnd: 'Fim',
  extraInstructions: 'Instruções extras (opcional)',
  extraPromptPlaceholder: 'Ex: foque em assinaturas e contas de casa.',
  analyzingTransactions: 'Analisando transações...',
  generateAgain: 'Gerar novamente',
  generateSuggestions: 'Gerar sugestões',
  deselectAll: 'Desmarcar todos',
  selectAll: 'Selecionar todos',
  selectedCount: 'selecionados',
  adding: 'Adicionando...',
  addItems: 'Adicionar {n} item(ns)',

  // AI recurrence labels (displayed on suggestion cards)
  recurrenceLabelOnce: 'Única',
  recurrenceLabelMonthly: 'Mensal',
  recurrenceLabelWeekly: 'Semanal',
  recurrenceLabelYearly: 'Anual',

  // AI suggestion toast / error messages
  selectValidPeriod: 'Selecione um período válido',
  startBeforeEnd: 'A data inicial deve ser anterior à final',
  generateSuggestionsError: 'Erro ao gerar sugestões',
  noRecurringFound:
    'A IA não encontrou pagamentos recorrentes claros no período.',
  serverError: 'Falha ao se comunicar com o servidor.',
  communicationFailed: 'Falha na comunicação',
  selectAtLeastOne: 'Selecione ao menos uma sugestão',
  paymentsAdded: '{n} pagamento(s) adicionados',
} as const

type Section = { [K in keyof typeof pt]: string }

const en: Section = {
  title: 'Payments Assistant',
  subtitle: 'Track bills to pay, recurrences and mark what has been paid.',
  suggestWithAI: 'Suggest with AI',
  ai: 'AI',
  newPayment: 'New payment',
  newShort: 'New',

  statToPay: 'To pay',
  statOverdue: 'Overdue',
  statNext7Days: 'Next 7 days',
  statPaidPeriod: 'Paid (period)',
  itemsCount: 'item(s)',

  pending: 'Pending',
  paid: 'Paid',

  allUpToDateTitle: 'All up to date!',
  allUpToDateDescription:
    'No pending payments. Use the button above to schedule or ask the AI for suggestions.',
  noPaidTitle: 'No completed payments in the period',
  noPaidDescription: 'Mark payments as paid to track your history.',

  dueOn: 'Due',
  dueToday: 'Due today',
  dueInOneDay: 'Due in 1 day',
  dueInDays: 'Due in {n} days',
  overdueOn: 'Due {date}',
  recurring: 'Recurring',
  occurrences: 'occurrences',
  recurringSeries: 'Recurring series',
  deleteFullSeries: 'Delete entire series',

  markAsPaid: 'Mark as paid',
  markAsPending: 'Mark as pending',
  editAction: 'Edit',
  deleteAction: 'Delete',

  markedAsPaid: 'Payment marked as paid',
  markedAsPending: 'Payment marked as pending',
  paymentDeleted: 'Payment deleted',
  paymentUpdated: 'Payment updated',
  paymentScheduled: 'Payment scheduled',
  paymentsScheduled: '{n} payments scheduled',
  occurrencesDeleted: '{n} occurrence(s) deleted',

  deletePaymentTitle: 'Delete payment?',
  deletePaymentConfirm: 'Delete',
  deletePaymentSuffix: 'will be removed. This action cannot be undone.',
  deleteSeriesTitle: 'Delete entire series?',
  deleteSeriesPrefix: 'All occurrences of',
  deleteSeriesSuffix: 'will be removed. This action cannot be undone.',
  deleteSeriesConfirm: 'Delete all',

  editPaymentTitle: 'Edit Payment',
  newPaymentTitle: 'New Scheduled Payment',

  type: 'Type',
  description: 'Description',
  descriptionPlaceholder: 'E.g.: Rent, Internet, Netflix',
  amount: 'Amount',
  amountPlaceholder: '0.00',
  dueDate: 'Due date',
  category: 'Category',
  categoryPlaceholder: 'Select',
  recurrence: 'Recurrence',
  notes: 'Notes',
  notesOptional: '(optional)',
  notesPlaceholder: 'Additional details...',

  recurrenceOnce: 'Once',
  recurrenceMonthly: 'Monthly',
  recurrenceWeekly: 'Weekly',
  recurrenceYearly: 'Yearly',

  fixedQuantity: 'Fixed quantity',
  indefinite: 'Indefinite',
  occurrencesLabel: 'Occurrences',
  indefiniteHint:
    'Several future occurrences will be generated automatically (5 years for monthly, 2 years for weekly, 30 years for yearly). You can delete the series at any time.',

  descriptionMin: 'Description must be at least 3 characters',
  descriptionMax: 'Description must be at most 255 characters',
  amountRequired: 'Enter an amount',
  amountPositive: 'Amount must be positive',
  dueDateRequired: 'Due date is required',
  quantityRequired: 'Enter the quantity',
  quantityMin: 'Minimum 1',
  quantityMax: 'Maximum 360',

  aiSuggestionsTitle: 'AI Suggestions',
  aiSuggestionsIntro:
    'The AI analyzes completed transactions from the chosen period and suggests recurring payments and fixed bills that can be scheduled.',
  rangeStart: 'Start',
  rangeEnd: 'End',
  extraInstructions: 'Extra instructions (optional)',
  extraPromptPlaceholder: 'E.g.: focus on subscriptions and household bills.',
  analyzingTransactions: 'Analyzing transactions...',
  generateAgain: 'Generate again',
  generateSuggestions: 'Generate suggestions',
  deselectAll: 'Deselect all',
  selectAll: 'Select all',
  selectedCount: 'selected',
  adding: 'Adding...',
  addItems: 'Add {n} item(s)',

  recurrenceLabelOnce: 'Once',
  recurrenceLabelMonthly: 'Monthly',
  recurrenceLabelWeekly: 'Weekly',
  recurrenceLabelYearly: 'Yearly',

  selectValidPeriod: 'Select a valid period',
  startBeforeEnd: 'The start date must be before the end date',
  generateSuggestionsError: 'Error generating suggestions',
  noRecurringFound: 'The AI found no clear recurring payments in the period.',
  serverError: 'Failed to communicate with the server.',
  communicationFailed: 'Communication failed',
  selectAtLeastOne: 'Select at least one suggestion',
  paymentsAdded: '{n} payment(s) added',
}

const es: Section = {
  title: 'Asistente de Pagos',
  subtitle: 'Controla cuentas por pagar, recurrencias y marca lo ya pagado.',
  suggestWithAI: 'Sugerir con IA',
  ai: 'IA',
  newPayment: 'Nuevo pago',
  newShort: 'Nuevo',

  statToPay: 'Por pagar',
  statOverdue: 'Vencidos',
  statNext7Days: 'Próximos 7 días',
  statPaidPeriod: 'Pagados (período)',
  itemsCount: 'ítem(s)',

  pending: 'Pendientes',
  paid: 'Pagados',

  allUpToDateTitle: '¡Todo al día!',
  allUpToDateDescription:
    'Ningún pago pendiente. Usa el botón de arriba para programar o pedir sugerencias a la IA.',
  noPaidTitle: 'Ningún pago completado en el período',
  noPaidDescription: 'Marca pagos como pagados para seguir el historial.',

  dueOn: 'Vence',
  dueToday: 'Vence hoy',
  dueInOneDay: 'Vence en 1 día',
  dueInDays: 'Vence en {n} días',
  overdueOn: 'Venció {date}',
  recurring: 'Recurrente',
  occurrences: 'ocurrencias',
  recurringSeries: 'Serie recurrente',
  deleteFullSeries: 'Eliminar serie completa',

  markAsPaid: 'Marcar como pagado',
  markAsPending: 'Marcar como pendiente',
  editAction: 'Editar',
  deleteAction: 'Eliminar',

  markedAsPaid: 'Pago marcado como pagado',
  markedAsPending: 'Pago marcado como pendiente',
  paymentDeleted: 'Pago eliminado',
  paymentUpdated: 'Pago actualizado',
  paymentScheduled: 'Pago programado',
  paymentsScheduled: '{n} pagos programados',
  occurrencesDeleted: '{n} ocurrencia(s) eliminada(s)',

  deletePaymentTitle: '¿Eliminar pago?',
  deletePaymentConfirm: 'Eliminar',
  deletePaymentSuffix: 'será eliminado. Esta acción no se puede deshacer.',
  deleteSeriesTitle: '¿Eliminar serie completa?',
  deleteSeriesPrefix: 'Todas las ocurrencias de',
  deleteSeriesSuffix:
    'serán eliminadas. Esta acción no se puede deshacer.',
  deleteSeriesConfirm: 'Eliminar todo',

  editPaymentTitle: 'Editar Pago',
  newPaymentTitle: 'Nuevo Pago Programado',

  type: 'Tipo',
  description: 'Descripción',
  descriptionPlaceholder: 'Ej: Alquiler, Internet, Netflix',
  amount: 'Importe',
  amountPlaceholder: '0,00',
  dueDate: 'Vencimiento',
  category: 'Categoría',
  categoryPlaceholder: 'Selecciona',
  recurrence: 'Recurrencia',
  notes: 'Notas',
  notesOptional: '(opcional)',
  notesPlaceholder: 'Detalles adicionales...',

  recurrenceOnce: 'Una vez',
  recurrenceMonthly: 'Mensual',
  recurrenceWeekly: 'Semanal',
  recurrenceYearly: 'Anual',

  fixedQuantity: 'Cantidad fija',
  indefinite: 'Indefinida',
  occurrencesLabel: 'Ocurrencias',
  indefiniteHint:
    'Se generarán automáticamente varias ocurrencias futuras (5 años para mensual, 2 años para semanal, 30 años para anual). Podrás eliminar la serie en cualquier momento.',

  descriptionMin: 'La descripción debe tener al menos 3 caracteres',
  descriptionMax: 'La descripción debe tener como máximo 255 caracteres',
  amountRequired: 'Ingresa un importe',
  amountPositive: 'El importe debe ser positivo',
  dueDateRequired: 'La fecha de vencimiento es obligatoria',
  quantityRequired: 'Ingresa la cantidad',
  quantityMin: 'Mínimo 1',
  quantityMax: 'Máximo 360',

  aiSuggestionsTitle: 'Sugerencias con IA',
  aiSuggestionsIntro:
    'La IA analiza las transacciones completadas del período elegido y sugiere pagos recurrentes y cuentas fijas que se pueden programar.',
  rangeStart: 'Inicio',
  rangeEnd: 'Fin',
  extraInstructions: 'Instrucciones extra (opcional)',
  extraPromptPlaceholder:
    'Ej: enfócate en suscripciones y cuentas del hogar.',
  analyzingTransactions: 'Analizando transacciones...',
  generateAgain: 'Generar de nuevo',
  generateSuggestions: 'Generar sugerencias',
  deselectAll: 'Desmarcar todos',
  selectAll: 'Seleccionar todos',
  selectedCount: 'seleccionados',
  adding: 'Añadiendo...',
  addItems: 'Añadir {n} ítem(s)',

  recurrenceLabelOnce: 'Única',
  recurrenceLabelMonthly: 'Mensual',
  recurrenceLabelWeekly: 'Semanal',
  recurrenceLabelYearly: 'Anual',

  selectValidPeriod: 'Selecciona un período válido',
  startBeforeEnd: 'La fecha inicial debe ser anterior a la final',
  generateSuggestionsError: 'Error al generar sugerencias',
  noRecurringFound:
    'La IA no encontró pagos recurrentes claros en el período.',
  serverError: 'Error al comunicarse con el servidor.',
  communicationFailed: 'Error de comunicación',
  selectAtLeastOne: 'Selecciona al menos una sugerencia',
  paymentsAdded: '{n} pago(s) añadidos',
}

export const paymentsDict = { pt, en, es }
