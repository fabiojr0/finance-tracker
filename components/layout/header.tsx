'use client'

import { useState, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlobalSearch } from '@/components/shared/global-search'
import { useTransactionModal } from '@/components/transactions/transaction-modal'
import { Menu, Bell, Plus, Search } from 'lucide-react'

interface HeaderProps {
  onMenuClick?: () => void
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/transacoes': 'Transações',
  '/categorias': 'Categorias',
  '/contas': 'Contas',
  '/investimentos': 'Investimentos',
  '/configuracoes': 'Configurações',
  '/relatorios': 'Relatórios',
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const { openModal } = useTransactionModal()
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  const pageTitle = useMemo(() => {
    return PAGE_TITLES[pathname] || 'Dashboard'
  }, [pathname])

  const currentMonth = useMemo(() => {
    const now = new Date()
    return now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      .replace(/^\w/, (c) => c.toUpperCase())
  }, [])

  return (
    <header className="bg-neutral-900/50 backdrop-blur-sm border-b border-neutral-800 sticky top-0 z-10">
      <div className="flex items-center justify-between px-3 sm:px-4 py-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-neutral-800 rounded-md flex-shrink-0"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5 text-neutral-400" />
          </button>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-white truncate">{pageTitle}</h1>
            <Badge className="bg-neutral-700 text-neutral-300 text-xs hidden sm:inline-flex">
              {currentMonth}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            aria-label="Buscar"
          >
            <Search className="h-5 w-5 text-neutral-400" />
          </button>

          {/* Desktop Search */}
          <GlobalSearch />

          <button className="relative p-2 hover:bg-neutral-800 rounded-lg transition-colors">
            <Bell className="h-5 w-5 text-neutral-400" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-primary text-[10px] font-bold text-white rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          <Button size="sm" className="gap-1.5 h-9" onClick={openModal}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Transação</span>
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="md:hidden px-3 pb-3 border-t border-neutral-800 pt-3">
          <GlobalSearch isMobile onClose={() => setShowMobileSearch(false)} />
        </div>
      )}
    </header>
  )
}
