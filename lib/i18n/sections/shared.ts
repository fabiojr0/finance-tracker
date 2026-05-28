// Shared/misc component translations (pt-BR, en, es).
// `pt` is the reference shape; `en` and `es` are enforced to match it.
// Only strings unique to the shared components live here. Reuse t.common.*,
// t.transactionTypes.* and t.transactionStatus.* from the central dictionary
// for everything that already exists there.

const pt = {
  // Global search
  searchPlaceholder: 'Buscar transações...',
  searchPlaceholderShortcut: 'Buscar transações... (Ctrl+K)',
  searchNoResults: 'Nenhum resultado encontrado para',
  resultsTransactions: 'Transações',
  resultsCategories: 'Categorias',
  uncategorized: 'Sem categoria',
  hintNavigate: 'Use ↑↓ para navegar',
  hintTap: 'Toque para selecionar',
  hintSelectClose: 'Enter para selecionar • Esc para fechar',

  // Confirm dialog default labels
  confirmDeleteLabel: 'Excluir',

  // Date input mask placeholder (input order is always day/month/year)
  datePlaceholder: 'dd/mm/aaaa',
} as const

type Section = { [K in keyof typeof pt]: string }

const en: Section = {
  searchPlaceholder: 'Search transactions...',
  searchPlaceholderShortcut: 'Search transactions... (Ctrl+K)',
  searchNoResults: 'No results found for',
  resultsTransactions: 'Transactions',
  resultsCategories: 'Categories',
  uncategorized: 'Uncategorized',
  hintNavigate: 'Use ↑↓ to navigate',
  hintTap: 'Tap to select',
  hintSelectClose: 'Enter to select • Esc to close',

  confirmDeleteLabel: 'Delete',

  datePlaceholder: 'dd/mm/yyyy',
}

const es: Section = {
  searchPlaceholder: 'Buscar transacciones...',
  searchPlaceholderShortcut: 'Buscar transacciones... (Ctrl+K)',
  searchNoResults: 'No se encontraron resultados para',
  resultsTransactions: 'Transacciones',
  resultsCategories: 'Categorías',
  uncategorized: 'Sin categoría',
  hintNavigate: 'Usa ↑↓ para navegar',
  hintTap: 'Toca para seleccionar',
  hintSelectClose: 'Enter para seleccionar • Esc para cerrar',

  confirmDeleteLabel: 'Eliminar',

  datePlaceholder: 'dd/mm/aaaa',
}

export const sharedDict = { pt, en, es }
