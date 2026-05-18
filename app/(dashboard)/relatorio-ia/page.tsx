'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DateInput } from '@/components/ui/date-input'
import {
  PeriodSelector,
  getDateRange,
  PeriodKey,
} from '@/components/shared/period-selector'
import { formatCurrency } from '@/lib/utils/format-currency'
import { cn } from '@/lib/utils/cn'
import {
  Sparkles,
  Loader2,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  AlertTriangle,
  Lightbulb,
  ListChecks,
} from 'lucide-react'

interface CategoryItem {
  nome: string
  valor: number
  percentual: number
  observacao: string
}

interface AIReport {
  resumo: string
  destaques: string[]
  categorias_principais: CategoryItem[]
  alertas: string[]
  recomendacoes: string[]
}

interface ReportSummary {
  period: { start: string; end: string; label: string | null }
  income: number
  expenses: number
  investments: number
  balance: number
  savingsRate: number | null
  transactionCount: number
}

interface ReportResponse {
  report: AIReport
  summary: ReportSummary
}

const PERIOD_LABELS: Record<PeriodKey, string> = {
  'all': 'Todos os períodos',
  'custom': 'Personalizado',
  'this-month': 'Este mês',
  'last-month': 'Mês anterior',
  'last-3-months': 'Últimos 3 meses',
  'last-6-months': 'Últimos 6 meses',
  'last-12-months': 'Últimos 12 meses',
  'this-year': 'Este ano',
}

function toISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function todayISO(): string {
  return toISO(new Date())
}

function firstDayOfMonthISO(): string {
  const d = new Date()
  return toISO(new Date(d.getFullYear(), d.getMonth(), 1))
}

export default function AIReportPage() {
  const [period, setPeriod] = useState<PeriodKey>('this-month')
  const [customStart, setCustomStart] = useState(firstDayOfMonthISO())
  const [customEnd, setCustomEnd] = useState(todayISO())
  const [customPrompt, setCustomPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ReportResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const resolvedRange = useMemo(() => {
    if (period === 'custom') {
      return { startDate: customStart, endDate: customEnd }
    }
    const range = getDateRange(period)
    if (!range) return null
    return {
      startDate: toISO(range.startDate),
      endDate: toISO(range.endDate),
    }
  }, [period, customStart, customEnd])

  const handleGenerate = async () => {
    if (!resolvedRange) {
      toast.error('Selecione um período válido')
      return
    }

    if (resolvedRange.startDate > resolvedRange.endDate) {
      toast.error('A data inicial deve ser anterior à final')
      return
    }

    setLoading(true)
    setError(null)
    setData(null)

    try {
      const res = await fetch('/api/ai-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: resolvedRange.startDate,
          endDate: resolvedRange.endDate,
          periodLabel: PERIOD_LABELS[period],
          customPrompt: customPrompt.trim() || undefined,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        const message = json?.error || 'Erro ao gerar relatório'
        setError(message)
        toast.error(message)
        return
      }

      setData(json as ReportResponse)
      toast.success('Relatório gerado!')
    } catch (err) {
      console.error(err)
      const message = 'Falha ao se comunicar com o servidor.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-purple-500/15 p-1.5">
            <Sparkles className="h-5 w-5 text-purple-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Relatório com IA
          </h1>
        </div>
        <p className="text-neutral-400 text-sm">
          Escolha um período e gere uma análise inteligente das suas finanças,
          baseada nas transações, valores e categorias.
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg">Período de análise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <PeriodSelector
            selected={period}
            onChange={setPeriod}
            showCustom
          />

          {period === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start" className="text-neutral-300">
                  Data inicial
                </Label>
                <div className="mt-1.5">
                  <DateInput value={customStart} onChange={setCustomStart} />
                </div>
              </div>
              <div>
                <Label htmlFor="end" className="text-neutral-300">
                  Data final
                </Label>
                <div className="mt-1.5">
                  <DateInput value={customEnd} onChange={setCustomEnd} />
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="prompt" className="text-neutral-300">
              Instruções adicionais (opcional)
            </Label>
            <textarea
              id="prompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Ex.: foque nos gastos com alimentação, ou compare com o mês anterior."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5 resize-none"
              disabled={loading}
            />
            <p className="text-xs text-neutral-500 mt-1.5">
              {customPrompt.length}/500 caracteres
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-xs text-neutral-500">
              {resolvedRange
                ? `${resolvedRange.startDate} a ${resolvedRange.endDate}`
                : 'Período não definido'}
            </p>
            <Button
              onClick={handleGenerate}
              disabled={loading || !resolvedRange}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Gerar relatório
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && !data && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center gap-3">
              <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
              <p className="text-neutral-300 text-sm font-medium">
                A IA está analisando suas transações
              </p>
              <p className="text-xs text-neutral-500 max-w-sm">
                Estamos consolidando suas receitas, despesas, investimentos e
                categorias para gerar uma análise personalizada. Isso pode levar
                alguns segundos.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && !loading && (
        <Card className="border-red-500/30">
          <CardContent className="py-6 px-4 sm:px-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-400">
                  Não foi possível gerar o relatório
                </p>
                <p className="text-xs text-neutral-400 mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {data && <ReportResult data={data} />}
    </div>
  )
}

function ReportResult({ data }: { data: ReportResponse }) {
  const { report, summary } = data

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryStat
          label="Receitas"
          value={formatCurrency(summary.income)}
          icon={TrendingUp}
          color="emerald"
        />
        <SummaryStat
          label="Despesas"
          value={formatCurrency(summary.expenses)}
          icon={TrendingDown}
          color="red"
        />
        <SummaryStat
          label="Investimentos"
          value={formatCurrency(summary.investments)}
          icon={PiggyBank}
          color="blue"
        />
        <SummaryStat
          label="Saldo"
          value={formatCurrency(summary.balance)}
          icon={Wallet}
          color={summary.balance >= 0 ? 'emerald' : 'red'}
        />
      </div>

      <Card>
        <CardHeader className="px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-purple-500/15 p-1.5">
              <Sparkles className="h-4 w-4 text-purple-400" />
            </div>
            <CardTitle className="text-base sm:text-lg">Resumo</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-line">
            {report.resumo}
          </p>
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-neutral-800">
            <Badge>
              {summary.transactionCount} transações
            </Badge>
            {summary.savingsRate !== null && (
              <Badge>
                Taxa de poupança: {summary.savingsRate.toFixed(1)}%
              </Badge>
            )}
            {summary.period.label && (
              <Badge>{summary.period.label}</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {report.destaques?.length > 0 && (
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-amber-500/15 p-1.5">
                <ListChecks className="h-4 w-4 text-amber-400" />
              </div>
              <CardTitle className="text-base sm:text-lg">Destaques</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <ul className="space-y-2">
              {report.destaques.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm text-neutral-200"
                >
                  <span className="text-amber-400 font-semibold flex-shrink-0">
                    {i + 1}.
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {report.categorias_principais?.length > 0 && (
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-red-500/15 p-1.5">
                <TrendingDown className="h-4 w-4 text-red-400" />
              </div>
              <CardTitle className="text-base sm:text-lg">
                Categorias principais
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            {report.categorias_principais.map((cat, i) => {
              const pct = Math.max(0, Math.min(100, Number(cat.percentual) || 0))
              return (
                <div key={i} className="space-y-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-medium text-neutral-200 truncate">
                      {cat.nome}
                    </p>
                    <div className="flex items-baseline gap-2 flex-shrink-0">
                      <span className="text-sm font-semibold text-neutral-100 tabular-nums">
                        {formatCurrency(Number(cat.valor) || 0)}
                      </span>
                      <span className="text-xs text-neutral-500 tabular-nums">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-red-400/80 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {cat.observacao && (
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {cat.observacao}
                    </p>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {report.alertas?.length > 0 && (
        <Card className="border-orange-500/20">
          <CardHeader className="px-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-orange-500/15 p-1.5">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
              </div>
              <CardTitle className="text-base sm:text-lg">
                Pontos de atenção
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <ul className="space-y-2">
              {report.alertas.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm text-neutral-200"
                >
                  <AlertTriangle className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {report.recomendacoes?.length > 0 && (
        <Card className="border-emerald-500/20">
          <CardHeader className="px-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-emerald-500/15 p-1.5">
                <Lightbulb className="h-4 w-4 text-emerald-400" />
              </div>
              <CardTitle className="text-base sm:text-lg">
                Recomendações
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <ul className="space-y-2">
              {report.recomendacoes.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm text-neutral-200"
                >
                  <Lightbulb className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

type ColorKey = 'emerald' | 'red' | 'blue' | 'orange'
const COLOR_MAP: Record<ColorKey, { border: string; bg: string; text: string }> = {
  emerald: {
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
    text: 'text-emerald-400',
  },
  red: {
    border: 'border-red-500/20',
    bg: 'bg-red-500/5',
    text: 'text-red-400',
  },
  blue: {
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    text: 'text-blue-400',
  },
  orange: {
    border: 'border-orange-500/20',
    bg: 'bg-orange-500/5',
    text: 'text-orange-400',
  },
}

function SummaryStat({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  color: ColorKey
}) {
  const c = COLOR_MAP[color]
  return (
    <div className={cn('rounded-xl border p-3 sm:p-4', c.border, c.bg)}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={cn('h-3.5 w-3.5', c.text)} />
        <p className="text-[10px] sm:text-xs font-medium text-neutral-400">
          {label}
        </p>
      </div>
      <p className={cn('text-sm sm:text-lg font-bold mt-0.5 truncate tabular-nums', c.text)}>
        {value}
      </p>
    </div>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-neutral-800/80 border border-neutral-700 px-2.5 py-1 text-xs text-neutral-300">
      {children}
    </span>
  )
}
