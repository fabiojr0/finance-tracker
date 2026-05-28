'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard,
  ArrowDownUp,
  Tag,
  CalendarDays,
  BarChart3,
  Sparkles,
  Receipt,
  Settings,
  X,
  LogOut,
} from 'lucide-react'
import { usePreferences } from '@/lib/contexts/preferences-context'
import { useUser } from '@/lib/hooks/use-user'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useUser()
  const { t } = usePreferences()

  const menuItems = [
    { href: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { href: '/transacoes', label: t.nav.transactions, icon: ArrowDownUp },
    { href: '/categorias', label: t.nav.categories, icon: Tag },
    { href: '/calendario', label: t.nav.calendar, icon: CalendarDays },
    { href: '/assistente-pagamentos', label: t.nav.payments, icon: Receipt },
    { href: '/estatisticas', label: t.nav.statistics, icon: BarChart3 },
    { href: '/relatorio-ia', label: t.nav.aiReport, icon: Sparkles },
    { href: '/configuracoes', label: t.nav.settings, icon: Settings },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen bg-neutral-900 border-r border-neutral-800 w-64 transition-transform duration-300 z-50',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Brand + mobile close button */}
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ftlogo.png" alt="Finance Tracker" className="h-9 w-9" />
              <span className="font-semibold text-white">Finance Tracker</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800 rounded-md lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-neutral-300 hover:bg-neutral-800'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-neutral-800 space-y-3">
            {user && (
              <p className="text-xs text-neutral-400 text-center truncate px-2">
                {user.email}
              </p>
            )}
            <button
              onClick={signOut}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>{t.nav.logout}</span>
            </button>
            <p className="text-xs text-neutral-500 text-center">
              Finance Tracker v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
