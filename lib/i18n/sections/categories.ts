// Category-area translations (pt-BR, en, es).
// `pt` is the reference shape; `en` and `es` are enforced to match it.
// Only category-unique strings live here. Reuse t.common.*, t.transactionTypes.*
// and t.transactionStatus.* from the central dictionary for shared strings.

const pt = {
  // Page header
  title: 'Categorias',
  subtitle: 'Organize suas transações por categoria',
  newCategory: 'Nova Categoria',
  totalCount: 'no total',
  count: 'categorias',

  // Section headers (one per transaction type)
  expensesTitle: 'Despesas',
  incomeTitle: 'Receitas',
  investmentsTitle: 'Investimentos',
  transfersTitle: 'Transferências',

  // Empty states per section
  emptyExpenseTitle: 'Nenhuma categoria de despesa',
  emptyExpenseDescription: 'Adicione categorias para organizar suas despesas.',
  emptyIncomeTitle: 'Nenhuma categoria de receita',
  emptyIncomeDescription: 'Adicione categorias para organizar suas receitas.',
  emptyInvestmentTitle: 'Nenhuma categoria de investimento',
  emptyInvestmentDescription: 'Adicione categorias para organizar seus investimentos.',
  emptyTransferTitle: 'Nenhuma categoria de transferência',
  emptyTransferDescription: 'Adicione categorias para organizar suas transferências.',

  // Delete confirmation
  deleteTitle: 'Excluir categoria?',
  deleteDescription: 'A categoria será removida. Esta ação não pode ser desfeita.',
  deleteDescriptionGeneric: 'Esta ação não pode ser desfeita.',

  // Form
  editCategory: 'Editar Categoria',
  categoryType: 'Tipo de Categoria',
  categoryName: 'Nome da Categoria',
  namePlaceholder: 'Ex: Alimentação',
  icon: 'Ícone',
  color: 'Cor',

  // Icon picker
  selectIcon: 'Selecione um ícone',
  chooseIcon: 'Escolher Ícone',
  searchIconPlaceholder: 'Buscar ícone...',
  noIconFound: 'Nenhum ícone encontrado',

  // Icon picker category groups
  groupFinance: 'Finanças',
  groupShopping: 'Compras',
  groupHousing: 'Moradia',
  groupTransport: 'Transporte',
  groupFood: 'Alimentação',
  groupHealth: 'Saúde',
  groupLeisure: 'Lazer',
  groupTech: 'Tecnologia',
  groupEducation: 'Educação',
  groupWork: 'Trabalho',
  groupFamily: 'Família',
  groupPersonal: 'Pessoal',
  groupServices: 'Serviços',
  groupNature: 'Natureza',

  // Category select
  selectPlaceholder: 'Selecione uma categoria',
  noCategoriesAvailable: 'Nenhuma categoria disponível',
  createCategory: 'Criar categoria',
} as const

type Section = { [K in keyof typeof pt]: string }

const en: Section = {
  title: 'Categories',
  subtitle: 'Organize your transactions by category',
  newCategory: 'New Category',
  totalCount: 'in total',
  count: 'categories',

  expensesTitle: 'Expenses',
  incomeTitle: 'Income',
  investmentsTitle: 'Investments',
  transfersTitle: 'Transfers',

  emptyExpenseTitle: 'No expense categories',
  emptyExpenseDescription: 'Add categories to organize your expenses.',
  emptyIncomeTitle: 'No income categories',
  emptyIncomeDescription: 'Add categories to organize your income.',
  emptyInvestmentTitle: 'No investment categories',
  emptyInvestmentDescription: 'Add categories to organize your investments.',
  emptyTransferTitle: 'No transfer categories',
  emptyTransferDescription: 'Add categories to organize your transfers.',

  deleteTitle: 'Delete category?',
  deleteDescription: 'The category will be removed. This action cannot be undone.',
  deleteDescriptionGeneric: 'This action cannot be undone.',

  editCategory: 'Edit Category',
  categoryType: 'Category Type',
  categoryName: 'Category Name',
  namePlaceholder: 'E.g. Food',
  icon: 'Icon',
  color: 'Color',

  selectIcon: 'Select an icon',
  chooseIcon: 'Choose Icon',
  searchIconPlaceholder: 'Search icon...',
  noIconFound: 'No icon found',

  groupFinance: 'Finance',
  groupShopping: 'Shopping',
  groupHousing: 'Housing',
  groupTransport: 'Transport',
  groupFood: 'Food',
  groupHealth: 'Health',
  groupLeisure: 'Leisure',
  groupTech: 'Technology',
  groupEducation: 'Education',
  groupWork: 'Work',
  groupFamily: 'Family',
  groupPersonal: 'Personal',
  groupServices: 'Services',
  groupNature: 'Nature',

  selectPlaceholder: 'Select a category',
  noCategoriesAvailable: 'No categories available',
  createCategory: 'Create category',
}

const es: Section = {
  title: 'Categorías',
  subtitle: 'Organiza tus transacciones por categoría',
  newCategory: 'Nueva Categoría',
  totalCount: 'en total',
  count: 'categorías',

  expensesTitle: 'Gastos',
  incomeTitle: 'Ingresos',
  investmentsTitle: 'Inversiones',
  transfersTitle: 'Transferencias',

  emptyExpenseTitle: 'Ninguna categoría de gasto',
  emptyExpenseDescription: 'Añade categorías para organizar tus gastos.',
  emptyIncomeTitle: 'Ninguna categoría de ingreso',
  emptyIncomeDescription: 'Añade categorías para organizar tus ingresos.',
  emptyInvestmentTitle: 'Ninguna categoría de inversión',
  emptyInvestmentDescription: 'Añade categorías para organizar tus inversiones.',
  emptyTransferTitle: 'Ninguna categoría de transferencia',
  emptyTransferDescription: 'Añade categorías para organizar tus transferencias.',

  deleteTitle: '¿Eliminar categoría?',
  deleteDescription: 'La categoría será eliminada. Esta acción no se puede deshacer.',
  deleteDescriptionGeneric: 'Esta acción no se puede deshacer.',

  editCategory: 'Editar Categoría',
  categoryType: 'Tipo de Categoría',
  categoryName: 'Nombre de la Categoría',
  namePlaceholder: 'Ej: Alimentación',
  icon: 'Icono',
  color: 'Color',

  selectIcon: 'Selecciona un icono',
  chooseIcon: 'Elegir Icono',
  searchIconPlaceholder: 'Buscar icono...',
  noIconFound: 'Ningún icono encontrado',

  groupFinance: 'Finanzas',
  groupShopping: 'Compras',
  groupHousing: 'Vivienda',
  groupTransport: 'Transporte',
  groupFood: 'Alimentación',
  groupHealth: 'Salud',
  groupLeisure: 'Ocio',
  groupTech: 'Tecnología',
  groupEducation: 'Educación',
  groupWork: 'Trabajo',
  groupFamily: 'Familia',
  groupPersonal: 'Personal',
  groupServices: 'Servicios',
  groupNature: 'Naturaleza',

  selectPlaceholder: 'Selecciona una categoría',
  noCategoriesAvailable: 'Ninguna categoría disponible',
  createCategory: 'Crear categoría',
}

export const categoriesDict = { pt, en, es }
