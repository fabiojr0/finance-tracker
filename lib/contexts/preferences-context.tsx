'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import { dictionaries, type Dictionary, type Locale } from '@/lib/i18n/dictionaries'
import { formatCurrency, localeTag } from '@/lib/utils/format-currency'

const LANG_KEY = 'ft_language'
const CUR_KEY = 'ft_currency'

const DEFAULT_LOCALE: Locale = 'pt'
const DEFAULT_CURRENCY = 'BRL'

export const SUPPORTED_LOCALES: Locale[] = ['pt', 'en', 'es']
export const SUPPORTED_CURRENCIES = ['BRL', 'USD', 'EUR'] as const

function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as string[]).includes(value)
}

function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE
  const lang = navigator.language?.slice(0, 2).toLowerCase()
  return isLocale(lang) ? lang : DEFAULT_LOCALE
}

interface PreferencesContextValue {
  locale: Locale
  currency: string
  setLocale: (locale: Locale) => void
  setCurrency: (currency: string) => void
  t: Dictionary
  formatMoney: (amount: number) => string
  localeTag: string
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [currency, setCurrencyState] = useState<string>(DEFAULT_CURRENCY)

  const supabase = useMemo(() => createClient(), [])

  // 1. Apply cached preferences from localStorage on mount (avoids SSR mismatch
  // by deferring to an effect), then 2. reconcile with the user's profile.
  useEffect(() => {
    const storedLang = localStorage.getItem(LANG_KEY)
    const storedCur = localStorage.getItem(CUR_KEY)
    if (isLocale(storedLang)) setLocaleState(storedLang)
    else setLocaleState(detectBrowserLocale())
    if (storedCur) setCurrencyState(storedCur)

    let active = true
    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user || !active) return

      // Try language + currency; fall back to currency only if the
      // `language` column hasn't been added to the database yet.
      let lang: unknown
      let cur: unknown
      const withLang = await supabase
        .from('profiles')
        .select('language, currency')
        .eq('id', user.id)
        .single()

      if (withLang.error) {
        const currencyOnly = await supabase
          .from('profiles')
          .select('currency')
          .eq('id', user.id)
          .single()
        cur = currencyOnly.data?.currency
      } else {
        lang = (withLang.data as { language?: string }).language
        cur = withLang.data?.currency
      }

      if (!active) return
      if (isLocale(lang)) {
        setLocaleState(lang)
        localStorage.setItem(LANG_KEY, lang)
      }
      if (typeof cur === 'string' && cur) {
        setCurrencyState(cur)
        localStorage.setItem(CUR_KEY, cur)
      }
    })()

    return () => {
      active = false
    }
  }, [supabase])

  // Keep the <html lang> attribute in sync with the active locale.
  useEffect(() => {
    document.documentElement.lang = localeTag(locale)
  }, [locale])

  const persist = useCallback(
    async (column: 'language' | 'currency', value: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('profiles').update({ [column]: value }).eq('id', user.id)
    },
    [supabase]
  )

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next)
      localStorage.setItem(LANG_KEY, next)
      void persist('language', next)
    },
    [persist]
  )

  const setCurrency = useCallback(
    (next: string) => {
      setCurrencyState(next)
      localStorage.setItem(CUR_KEY, next)
      void persist('currency', next)
    },
    [persist]
  )

  const value = useMemo<PreferencesContextValue>(
    () => ({
      locale,
      currency,
      setLocale,
      setCurrency,
      t: dictionaries[locale],
      formatMoney: (amount: number) => formatCurrency(amount, currency, locale),
      localeTag: localeTag(locale),
    }),
    [locale, currency, setLocale, setCurrency]
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (ctx === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider')
  }
  return ctx
}

/** Convenience hook returning just the translation dictionary. */
export function useT(): Dictionary {
  return usePreferences().t
}
