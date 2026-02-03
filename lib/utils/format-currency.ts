export function formatCurrency(
  amount: number,
  currency: string = 'BRL'
): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function parseCurrencyInput(value: string): number {
  // Remove all non-numeric characters except comma and dot
  const cleaned = value.replace(/[^\d,.-]/g, '')
  // Replace comma with dot for parsing
  const normalized = cleaned.replace(',', '.')
  return parseFloat(normalized) || 0
}
