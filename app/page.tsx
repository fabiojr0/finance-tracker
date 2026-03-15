import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BarChart3, Wallet, PieChart, ArrowRight, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 sm:p-8 bg-neutral-950 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/[0.07] via-transparent to-transparent" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-orange-500/5 rounded-full blur-[100px]" />

      <div className="relative text-center max-w-3xl z-10">
        {/* Logo / Brand */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-8">
          <Wallet className="h-4 w-4 text-orange-400" />
          <span className="text-sm font-medium text-orange-400">Finance Tracker</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight mb-4">
          Controle suas finanças de forma{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
            simples e moderna
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-neutral-400 mb-10 max-w-xl mx-auto leading-relaxed">
          Acompanhe receitas, despesas e investimentos em um só lugar com gráficos e relatórios inteligentes.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/cadastro">
            <Button size="lg" className="gap-2 px-6 h-12 text-base">
              Começar Agora
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="px-6 h-12 text-base">
              Fazer Login
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 text-left">
          <div className="group relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/80 p-6 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="rounded-xl bg-emerald-500/15 p-2.5 w-fit mb-4">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Dashboard Intuitivo</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Visualize seu saldo, receitas e despesas de forma clara e objetiva com gráficos interativos.
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/80 p-6 transition-all duration-300 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="rounded-xl bg-orange-500/15 p-2.5 w-fit mb-4">
                <TrendingUp className="h-5 w-5 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Controle Total</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Gerencie transações, categorias e acompanhe seus gastos mensais com facilidade.
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/80 p-6 transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="rounded-xl bg-blue-500/15 p-2.5 w-fit mb-4">
                <PieChart className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Relatórios</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Gráficos e análises detalhadas para entender melhor seus hábitos financeiros.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
