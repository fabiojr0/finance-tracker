import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { PreferencesProvider } from '@/lib/contexts/preferences-context'
import { DocumentTitle } from '@/components/shared/document-title'

const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'Finance Tracker',
  description: 'Controle suas receitas, despesas e investimentos com dashboards interativos e relatórios inteligentes.',
  icons: {
    icon: '/ftlogo.png',
    apple: '/ftlogo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={outfit.className} suppressHydrationWarning>
        <PreferencesProvider>
          <DocumentTitle />
          {children}
        </PreferencesProvider>
      </body>
    </html>
  )
}
