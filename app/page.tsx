import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-neutral-950 to-neutral-900">
      <div className="text-center max-w-3xl">
        <h1 className="text-6xl font-bold text-primary mb-4">
          Finance Tracker
        </h1>
        <p className="text-xl text-neutral-400 mb-8">
          Monitore suas finanças de forma simples e moderna
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/cadastro">
            <Button size="lg">Começar Agora</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Fazer Login
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2 text-neutral-200">Dashboard Intuitivo</h3>
            <p className="text-neutral-400 text-sm">
              Visualize seu saldo, receitas e despesas de forma clara e objetiva
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-lg font-semibold mb-2 text-neutral-200">Controle Total</h3>
            <p className="text-neutral-400 text-sm">
              Gerencie transações, categorias e acompanhe seus gastos mensais
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-lg font-semibold mb-2 text-neutral-200">Relatórios</h3>
            <p className="text-neutral-400 text-sm">
              Gráficos e análises para entender melhor seus hábitos financeiros
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
