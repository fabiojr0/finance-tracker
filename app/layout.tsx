import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'Finance Tracker — Controle Financeiro Inteligente',
  description: 'Controle suas receitas, despesas e investimentos com dashboards interativos e relatórios inteligentes.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={outfit.className} suppressHydrationWarning>{children}</body>
    </html>
  )
}
