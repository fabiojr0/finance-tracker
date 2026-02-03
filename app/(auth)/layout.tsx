import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-950 to-neutral-900">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Finance Tracker
          </h1>
          <p className="text-neutral-400">
            Gerencie suas finanças de forma simples
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
