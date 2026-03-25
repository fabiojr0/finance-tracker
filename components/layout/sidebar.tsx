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
  Settings,
  X,
  LogOut,
} from 'lucide-react'
import { UI_TEXT } from '@/lib/constants/ui-text'
import { useUser } from '@/lib/hooks/use-user'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const menuItems = [
  {
    href: '/dashboard',
    label: UI_TEXT.dashboard.title,
    icon: LayoutDashboard,
  },
  {
    href: '/transacoes',
    label: UI_TEXT.transactions.title,
    icon: ArrowDownUp,
  },
  {
    href: '/categorias',
    label: UI_TEXT.categories.title,
    icon: Tag,
  },
  {
    href: '/calendario',
    label: UI_TEXT.calendar.title,
    icon: CalendarDays,
  },
  {
    href: '/relatorios',
    label: UI_TEXT.reports.title,
    icon: BarChart3,
  },
  {
    href: '/configuracoes',
    label: UI_TEXT.settings.title,
    icon: Settings,
  },
]

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useUser()

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
          {/* Mobile close button */}
          <div className="flex items-center justify-between p-6 lg:hidden">
            <h2 className="font-semibold text-neutral-200">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800 rounded-md"
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
              <span>{UI_TEXT.auth.logout}</span>
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
