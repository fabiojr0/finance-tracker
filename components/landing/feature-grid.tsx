'use client'

import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, PieChart, Calendar, Shield } from 'lucide-react'

const features = [
  {
    icon: BarChart3,
    title: 'Dashboard Inteligente',
    description: 'Visualize saldo, receitas e despesas em gráficos interativos que se atualizam em tempo real.',
    accent: 'emerald',
    size: 'large',
  },
  {
    icon: TrendingUp,
    title: 'Controle de Gastos',
    description: 'Categorize transações e acompanhe para onde vai cada centavo do seu dinheiro.',
    accent: 'orange',
    size: 'small',
  },
  {
    icon: Calendar,
    title: 'Calendário Financeiro',
    description: 'Veja seus gastos organizados por dia, semana ou mês em uma visão de calendário.',
    accent: 'sky',
    size: 'small',
  },
  {
    icon: PieChart,
    title: 'Relatórios Detalhados',
    description: 'Análises por categoria, período e tendências para entender seus hábitos financeiros e otimizar seu orçamento.',
    accent: 'violet',
    size: 'large',
  },
  {
    icon: Shield,
    title: 'Segurança Total',
    description: 'Seus dados protegidos com autenticação moderna e criptografia de ponta.',
    accent: 'amber',
    size: 'full',
  },
]

const accentMap: Record<string, { bg: string; border: string; icon: string; glow: string }> = {
  emerald: {
    bg: 'bg-emerald-500/[0.06]',
    border: 'border-emerald-500/[0.1] hover:border-emerald-500/25',
    icon: 'text-emerald-400 bg-emerald-500/[0.12]',
    glow: 'from-emerald-500/[0.06]',
  },
  orange: {
    bg: 'bg-orange-500/[0.06]',
    border: 'border-orange-500/[0.1] hover:border-orange-500/25',
    icon: 'text-orange-400 bg-orange-500/[0.12]',
    glow: 'from-orange-500/[0.06]',
  },
  sky: {
    bg: 'bg-sky-500/[0.06]',
    border: 'border-sky-500/[0.1] hover:border-sky-500/25',
    icon: 'text-sky-400 bg-sky-500/[0.12]',
    glow: 'from-sky-500/[0.06]',
  },
  violet: {
    bg: 'bg-violet-500/[0.06]',
    border: 'border-violet-500/[0.1] hover:border-violet-500/25',
    icon: 'text-violet-400 bg-violet-500/[0.12]',
    glow: 'from-violet-500/[0.06]',
  },
  amber: {
    bg: 'bg-amber-500/[0.06]',
    border: 'border-amber-500/[0.1] hover:border-amber-500/25',
    icon: 'text-amber-400 bg-amber-500/[0.12]',
    glow: 'from-amber-500/[0.06]',
  },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  },
}

export function FeatureGrid() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-neutral-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,_rgba(249,115,22,0.04),_transparent_60%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header — Left aligned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          className="max-w-lg mb-16"
        >
          <p className="text-sm font-medium text-orange-400/80 tracking-widest uppercase mb-3">Funcionalidades</p>
          <h2 className="text-3xl md:text-4xl tracking-tighter leading-none font-bold text-zinc-100 mb-4">
            Tudo que você precisa para organizar suas finanças
          </h2>
          <p className="text-base text-zinc-500 leading-relaxed max-w-[50ch]">
            Ferramentas pensadas para simplificar a forma que você lida com dinheiro.
          </p>
        </motion.div>

        {/* Asymmetric Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {features.map((feature, i) => {
            const accent = accentMap[feature.accent]
            const Icon = feature.icon
            const isLarge = feature.size === 'large'
            const isFull = feature.size === 'full'

            return (
              <motion.div
                key={i}
                variants={cardVariants}
                whileHover={{ scale: 0.98, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                className={`group relative rounded-[1.5rem] border ${accent.border} bg-zinc-900/40 backdrop-blur-sm p-7 sm:p-8 transition-colors duration-300 cursor-default overflow-hidden ${
                  isFull ? 'md:col-span-2' : isLarge ? 'md:row-span-1' : ''
                }`}
              >
                {/* Inner glass refraction */}
                <div className="absolute inset-0 rounded-[1.5rem] border border-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" />

                {/* Hover glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${accent.glow} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative">
                  <div className={`rounded-xl ${accent.icon} p-2.5 w-fit mb-5`}>
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>

                  <h3 className="text-lg font-semibold text-zinc-100 mb-2 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed max-w-[45ch]">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
