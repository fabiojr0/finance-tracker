'use client'

import { ReactNode, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { FinanceProvider } from '@/lib/contexts/finance-context'
import { TransactionModalProvider } from '@/components/transactions/transaction-modal'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <FinanceProvider>
      <TransactionModalProvider>
        <div className="flex h-screen overflow-hidden bg-neutral-950">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <div className="flex-1 flex flex-col overflow-hidden">
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

            <main className="flex-1 overflow-y-auto p-4">
              <div className="max-w-7xl mx-auto">{children}</div>
            </main>
          </div>
        </div>
      </TransactionModalProvider>
    </FinanceProvider>
  )
}
