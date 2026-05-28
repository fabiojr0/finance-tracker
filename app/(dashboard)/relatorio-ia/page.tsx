'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DateInput } from '@/components/ui/date-input'
import { useConfirm } from '@/components/ui/confirm-dialog'
import {
  PeriodSelector,
  getDateRange,
  PeriodKey,
} from '@/components/shared/period-selector'
import { usePreferences } from '@/lib/contexts/preferences-context'
import { aiReportDict } from '@/lib/i18n/sections/ai-report'
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
  History,
  Trash2,
  Eye,
  Calendar,
  X,
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
  id: string | null
  createdAt: string
  report: AIReport
  summary: ReportSummary
}

interface SavedReportListItem {
  id: string
  start_date: string
  end_date: string
  period_label: string | null
  custom_prompt: string | null
  summary: ReportSummary
  created_at: string
}

interface SavedReportFull {
  id: string
  start_date: string
  end_date: string
  period_label: string | null
  custom_prompt: string | null
  report: AIReport
  summary: ReportSummary
  created_at: string
}

type AiReportText = { [K in keyof (typeof aiReportDict)['pt']]: string }

const PERIOD_LABEL_KEYS: Record<PeriodKey, keyof AiReportText> = {
  'all': 'periodAll',
  'custom': 'periodCustom',
  'this-month': 'periodThisMonth',
  'last-month': 'periodLastMonth',
  'last-3-months': 'periodLast3Months',
  'last-6-months': 'periodLast6Months',
  'last-12-months': 'periodLast12Months',
  'this-year': 'periodThisYear',
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

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

function formatDateTime(iso: string, localeTag: string): string {
  const dt = new Date(iso)
  if (Number.isNaN(dt.getTime())) return iso
  return dt.toLocaleString(localeTag, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AIReportPage() {
  const confirm = useConfirm()
  const { locale, formatMoney, localeTag } = usePreferences()
  const t = aiReportDict[locale]
  const [period, setPeriod] = useState<PeriodKey>('this-month')
  const [customStart, setCustomStart] = useState(firstDayOfMonthISO())
  const [customEnd, setCustomEnd] = useState(todayISO())
  const [customPrompt, setCustomPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ReportResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [savedReports, setSavedReports] = useState<SavedReportListItem[]>([])
  const [loadingSaved, setLoadingSaved] = useState(true)
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null)
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  const loadSavedReports = useCallback(async () => {
    setLoadingSaved(true)
    try {
      const res = await fetch('/api/ai-report/saved')
      const json = await res.json()
      if (!res.ok) {
        toast.error(json?.error || t.loadSavedError)
        return
      }
      setSavedReports((json.reports as SavedReportListItem[]) ?? [])
    } catch (err) {
      console.error(err)
      toast.error(t.loadSavedFailed)
    } finally {
      setLoadingSaved(false)
    }
  }, [t])

  useEffect(() => {
    loadSavedReports()
  }, [loadSavedReports])

  const handleGenerate = async () => {
    if (!resolvedRange) {
      toast.error(t.selectValidPeriod)
      return
    }

    if (resolvedRange.startDate > resolvedRange.endDate) {
      toast.error(t.startBeforeEnd)
      return
    }

    setLoading(true)
    setError(null)
    setData(null)
    setActiveSavedId(null)

    try {
      const res = await fetch('/api/ai-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: resolvedRange.startDate,
          endDate: resolvedRange.endDate,
          periodLabel: t[PERIOD_LABEL_KEYS[period]],
          customPrompt: customPrompt.trim() || undefined,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        const message = json?.error || t.generateError
        setError(message)
        toast.error(message)
        return
      }

      const response = json as ReportResponse
      setData(response)
      setActiveSavedId(response.id)
      toast.success(t.reportGenerated)
      loadSavedReports()
    } catch (err) {
      console.error(err)
      const message = t.serverError
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenSaved = async (id: string) => {
    if (openingId) return
    setOpeningId(id)
    setError(null)
    try {
      const res = await fetch(`/api/ai-report/saved/${id}`)
      const json = await res.json()
      if (!res.ok) {
        toast.error(json?.error || t.openError)
        return
      }
      const full = json as SavedReportFull
      setData({
        id: full.id,
        createdAt: full.created_at,
        report: full.report,
        summary: full.summary,
      })
      setActiveSavedId(full.id)
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err) {
      console.error(err)
      toast.error(t.openFailed)
    } finally {
      setOpeningId(null)
    }
  }

  const handleDeleteSaved = async (item: SavedReportListItem) => {
    const ok = await confirm({
      title: t.deleteTitle,
      description: (
        <>
          {t.deletePrefix}{' '}
          <strong>
            {formatDate(item.start_date)} {t.rangeSeparator} {formatDate(item.end_date)}
          </strong>{' '}
          {t.generatedAt.toLowerCase()} {formatDateTime(item.created_at, localeTag)} {t.deleteSuffix}
        </>
      ),
      confirmLabel: t.deleteConfirmLabel,
      variant: 'destructive',
    })
    if (!ok) return

    setDeletingId(item.id)
    try {
      const res = await fetch(`/api/ai-report/saved/${item.id}`, {
        method: 'DELETE',
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json?.error || t.deleteError)
        return
      }
      toast.success(t.reportDeleted)
      setSavedReports((prev) => prev.filter((r) => r.id !== item.id))
      if (activeSavedId === item.id) {
        setData(null)
        setActiveSavedId(null)
      }
    } catch (err) {
      console.error(err)
      toast.error(t.deleteFailed)
    } finally {
      setDeletingId(null)
    }
  }

  const handleCloseReport = () => {
    setData(null)
    setActiveSavedId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-purple-500/15 p-1.5">
            <Sparkles className="h-5 w-5 text-purple-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {t.title}
          </h1>
        </div>
        <p className="text-neutral-400 text-sm">
          {t.subtitle}
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg">{t.analysisPeriod}</CardTitle>
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
                  {t.startDate}
                </Label>
                <div className="mt-1.5">
                  <DateInput value={customStart} onChange={setCustomStart} />
                </div>
              </div>
              <div>
                <Label htmlFor="end" className="text-neutral-300">
                  {t.endDate}
                </Label>
                <div className="mt-1.5">
                  <DateInput value={customEnd} onChange={setCustomEnd} />
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="prompt" className="text-neutral-300">
              {t.additionalInstructions}
            </Label>
            <textarea
              id="prompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder={t.promptPlaceholder}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5 resize-none"
              disabled={loading}
            />
            <p className="text-xs text-neutral-500 mt-1.5">
              {customPrompt.length}/500 {t.charactersCount}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-xs text-neutral-500">
              {resolvedRange
                ? `${resolvedRange.startDate} ${t.rangeSeparator} ${resolvedRange.endDate}`
                : t.periodNotDefined}
            </p>
            <Button
              onClick={handleGenerate}
              disabled={loading || !resolvedRange}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.analyzing}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {t.generateReport}
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
                {t.loadingTitle}
              </p>
              <p className="text-xs text-neutral-500 max-w-sm">
                {t.loadingDescription}
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
                  {t.errorTitle}
                </p>
                <p className="text-xs text-neutral-400 mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {data && (
        <ReportResult
          data={data}
          onClose={handleCloseReport}
          t={t}
          formatMoney={formatMoney}
          localeTag={localeTag}
        />
      )}

      <SavedReportsList
        items={savedReports}
        loading={loadingSaved}
        activeId={activeSavedId}
        openingId={openingId}
        deletingId={deletingId}
        onOpen={handleOpenSaved}
        onDelete={handleDeleteSaved}
        t={t}
        formatMoney={formatMoney}
        localeTag={localeTag}
      />
    </div>
  )
}

function SavedReportsList({
  items,
  loading,
  activeId,
  openingId,
  deletingId,
  onOpen,
  onDelete,
  t,
  formatMoney,
  localeTag,
}: {
  items: SavedReportListItem[]
  loading: boolean
  activeId: string | null
  openingId: string | null
  deletingId: string | null
  onOpen: (id: string) => void
  onDelete: (item: SavedReportListItem) => void
  t: AiReportText
  formatMoney: (amount: number) => string
  localeTag: string
}) {
  return (
    <Card>
      <CardHeader className="px-4 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-blue-500/15 p-1.5">
              <History className="h-4 w-4 text-blue-400" />
            </div>
            <CardTitle className="text-base sm:text-lg">
              {t.savedReports}
            </CardTitle>
          </div>
          {!loading && items.length > 0 && (
            <span className="text-xs text-neutral-500">
              {items.length}{' '}
              {items.length === 1 ? t.savedReportSingular : t.savedReportPlural}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 text-neutral-500 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-6">
            {t.noSavedReports}
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => {
              const isActive = activeId === item.id
              const isOpening = openingId === item.id
              const isDeleting = deletingId === item.id
              return (
                <li
                  key={item.id}
                  className={cn(
                    'rounded-lg border p-3 transition-colors',
                    isActive
                      ? 'border-purple-500/40 bg-purple-500/5'
                      : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-neutral-100">
                          {item.period_label || t.custom}
                        </span>
                        {isActive && (
                          <span className="inline-flex items-center rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 text-[10px] font-medium">
                            {t.viewing}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.start_date)} {t.rangeSeparator} {formatDate(item.end_date)}
                        </span>
                        <span className="text-neutral-500">
                          {t.generatedAt} {formatDateTime(item.created_at, localeTag)}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-neutral-500">
                        <span>
                          {t.income}:{' '}
                          <span className="text-emerald-400 tabular-nums">
                            {formatMoney(item.summary?.income ?? 0)}
                          </span>
                        </span>
                        <span>
                          {t.expenses}:{' '}
                          <span className="text-red-400 tabular-nums">
                            {formatMoney(item.summary?.expenses ?? 0)}
                          </span>
                        </span>
                        <span>
                          {t.balance}:{' '}
                          <span
                            className={cn(
                              'tabular-nums',
                              (item.summary?.balance ?? 0) >= 0
                                ? 'text-emerald-400'
                                : 'text-red-400'
                            )}
                          >
                            {formatMoney(item.summary?.balance ?? 0)}
                          </span>
                        </span>
                        <span>
                          {item.summary?.transactionCount ?? 0} {t.transactionsCount}
                        </span>
                      </div>
                      {item.custom_prompt && (
                        <p className="mt-1.5 text-[11px] text-neutral-500 italic line-clamp-2">
                          “{item.custom_prompt}”
                        </p>
                      )}
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title={t.view}
                        onClick={() => onOpen(item.id)}
                        disabled={isOpening || isDeleting}
                      >
                        {isOpening ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        title={t.deleteConfirmLabel}
                        onClick={() => onDelete(item)}
                        disabled={isDeleting || isOpening}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function ReportResult({
  data,
  onClose,
  t,
  formatMoney,
  localeTag,
}: {
  data: ReportResponse
  onClose: () => void
  t: AiReportText
  formatMoney: (amount: number) => string
  localeTag: string
}) {
  const { report, summary, createdAt } = data

  return (
    <div className="space-y-6">
      <Card className="border-purple-500/20 bg-purple-500/[0.03]">
        <CardContent className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-300">
              <span className="inline-flex items-center gap-1.5 font-medium text-neutral-100">
                <Calendar className="h-3.5 w-3.5 text-purple-400" />
                {formatDate(summary.period.start)} {t.rangeSeparator} {formatDate(summary.period.end)}
              </span>
              {summary.period.label && (
                <span className="text-neutral-400">
                  · {summary.period.label}
                </span>
              )}
              <span className="text-neutral-500">
                · {t.generatedAt} {formatDateTime(createdAt, localeTag)}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title={t.closeReport}
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryStat
          label={t.income}
          value={formatMoney(summary.income)}
          icon={TrendingUp}
          color="emerald"
        />
        <SummaryStat
          label={t.expenses}
          value={formatMoney(summary.expenses)}
          icon={TrendingDown}
          color="red"
        />
        <SummaryStat
          label={t.investments}
          value={formatMoney(summary.investments)}
          icon={PiggyBank}
          color="blue"
        />
        <SummaryStat
          label={t.balance}
          value={formatMoney(summary.balance)}
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
            <CardTitle className="text-base sm:text-lg">{t.summaryLabel}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-line">
            {report.resumo}
          </p>
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-neutral-800">
            <Badge>
              {summary.transactionCount} {t.transactionsCount}
            </Badge>
            {summary.savingsRate !== null && (
              <Badge>
                {t.savingsRate}: {summary.savingsRate.toFixed(1)}%
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
              <CardTitle className="text-base sm:text-lg">{t.highlightsLabel}</CardTitle>
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
                {t.topCategoriesLabel}
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
                        {formatMoney(Number(cat.valor) || 0)}
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
                {t.attentionPointsLabel}
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
                {t.recommendationsLabel}
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
