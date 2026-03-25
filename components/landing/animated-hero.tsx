'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Wallet } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  },
}

const floatVariants = {
  animate: {
    y: [-8, 8, -8],
    rotate: [-1, 1, -1],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

function FloatingOrb({ className }: { className: string }) {
  return (
    <motion.div
      className={className}
      variants={floatVariants}
      animate="animate"
    />
  )
}

export function AnimatedHero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
      {/* Background mesh gradient */}
      <div className="absolute inset-0 bg-neutral-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_40%,_rgba(249,115,22,0.08),_transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_20%,_rgba(251,146,60,0.04),_transparent_60%)]" />

      {/* Floating ambient orbs */}
      <FloatingOrb className="absolute top-[15%] right-[10%] w-72 h-72 rounded-full bg-orange-500/[0.03] blur-[80px]" />
      <FloatingOrb className="absolute bottom-[20%] left-[5%] w-96 h-96 rounded-full bg-amber-500/[0.04] blur-[100px]" />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 items-center">
          {/* Left — Text Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-orange-500/[0.08] border border-orange-500/[0.15] mb-8">
                <Wallet className="h-4 w-4 text-orange-400/80" strokeWidth={1.5} />
                <span className="text-sm font-medium text-orange-400/90 tracking-wide">Finance Tracker</span>
              </div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-zinc-100 mb-6"
            >
              Seu dinheiro,
              <br />
              sob controle{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400/90 to-amber-400/80">
                total.
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base md:text-lg text-zinc-400 leading-relaxed max-w-[50ch] mb-10"
            >
              Acompanhe cada real com dashboards inteligentes.
              Receitas, despesas e investimentos organizados
              para você tomar decisões melhores.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex gap-4 items-center flex-wrap"
            >
              <Link href="/cadastro">
                <motion.div
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Button size="lg" className="gap-2.5 px-7 h-12 text-base rounded-xl">
                    Criar Conta Grátis
                    <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/login">
                <motion.div
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Button
                    variant="ghost"
                    size="lg"
                    className="px-6 h-12 text-base text-zinc-400 hover:text-zinc-200 rounded-xl"
                  >
                    Já tenho conta
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right — Visual Element */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 60, damping: 20, delay: 0.3 }}
            className="hidden md:flex justify-end"
          >
            <div className="relative w-full max-w-md">
              {/* Main dashboard preview card */}
              <div className="relative rounded-[2rem] border border-zinc-800/60 bg-zinc-900/50 backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)] p-8 overflow-hidden">
                {/* Inner refraction */}
                <div className="absolute inset-0 rounded-[2rem] border border-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" />

                <div className="relative space-y-6">
                  {/* Balance */}
                  <div>
                    <p className="text-xs font-medium text-zinc-500 tracking-widest uppercase mb-2">Saldo Total</p>
                    <p className="text-3xl font-bold text-zinc-100 tracking-tight">R$ 24.832<span className="text-zinc-500">,47</span></p>
                  </div>

                  {/* Mini stats row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-emerald-500/[0.08] border border-emerald-500/[0.12] p-4">
                      <p className="text-xs text-zinc-500 mb-1">Receitas</p>
                      <p className="text-lg font-semibold text-emerald-400">+R$ 8.420</p>
                    </div>
                    <div className="rounded-xl bg-rose-500/[0.08] border border-rose-500/[0.12] p-4">
                      <p className="text-xs text-zinc-500 mb-1">Despesas</p>
                      <p className="text-lg font-semibold text-rose-400">-R$ 3.187</p>
                    </div>
                  </div>

                  {/* Mini chart bars */}
                  <div>
                    <p className="text-xs font-medium text-zinc-500 tracking-widest uppercase mb-3">Últimos 7 dias</p>
                    <div className="flex items-end gap-2 h-16">
                      {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 rounded-md bg-gradient-to-t from-orange-500/30 to-orange-400/60"
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{
                            type: 'spring',
                            stiffness: 100,
                            damping: 20,
                            delay: 0.6 + i * 0.08,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notification card */}
              <motion.div
                initial={{ opacity: 0, y: 20, x: -20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 1.0 }}
                className="absolute -bottom-4 -left-8 rounded-2xl border border-zinc-800/60 bg-zinc-900/80 backdrop-blur-xl p-4 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.5)]"
              >
                <div className="absolute inset-0 rounded-2xl border border-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" />
                <div className="relative flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-300">Pagamento recebido</p>
                    <p className="text-xs text-zinc-500">+R$ 1.250,00</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
