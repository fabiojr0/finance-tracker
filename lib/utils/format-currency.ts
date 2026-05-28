export type AppLocale = 'pt' | 'en' | 'es'

// Maps the app language to the Intl/BCP-47 locale tag used for number, date
// and currency formatting.
export const LOCALE_TAG: Record<AppLocale, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
}

export function localeTag(locale: AppLocale = 'pt'): string {
  return LOCALE_TAG[locale] ?? 'pt-BR'
}

export function formatCurrency(
  amount: number,
  currency: string = 'BRL',
  locale: AppLocale | string = 'pt-BR'
): string {
  const tag = locale in LOCALE_TAG ? LOCALE_TAG[locale as AppLocale] : locale
  return new Intl.NumberFormat(tag, {
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
