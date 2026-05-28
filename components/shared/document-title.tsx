'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { usePreferences } from '@/lib/contexts/preferences-context'

const BRAND = 'Finance Tracker'

// Keeps the browser tab title localized per route. The brand name is never
// translated. Runs on the client because the language preference lives there.
export function DocumentTitle() {
  const pathname = usePathname()
  const { t } = usePreferences()

  useEffect(() => {
    const pageByPath: Record<string, string> = {
      '/login': t.auth.login,
      '/cadastro': t.auth.signup,
      '/dashboard': t.nav.dashboard,
      '/transacoes': t.nav.transactions,
      '/categorias': t.nav.categories,
      '/calendario': t.nav.calendar,
      '/assistente-pagamentos': t.header.paymentsAssistant,
      '/estatisticas': t.nav.statistics,
      '/relatorio-ia': t.nav.aiReport,
      '/configuracoes': t.nav.settings,
    }
    const page = pageByPath[pathname]
    document.title = page ? `${page} - ${BRAND}` : BRAND
  }, [pathname, t])

  return null
}
