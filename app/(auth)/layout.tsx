'use client'

import { ReactNode } from 'react'
import { useT } from '@/lib/contexts/preferences-context'

export default function AuthLayout({ children }: { children: ReactNode }) {
  const t = useT()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-950 to-neutral-900">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ftlogo.png"
            alt="Finance Tracker"
            className="h-20 w-20 mx-auto mb-3"
          />
          <h1 className="text-4xl font-bold text-primary mb-2">
            Finance Tracker
          </h1>
          <p className="text-neutral-400">
            {t.auth.tagline}
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
