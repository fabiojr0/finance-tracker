'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Modal, ModalHeader, ModalContent } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DateInput } from '@/components/ui/date-input'
import { PeriodSelector, getDateRange, PeriodKey } from '@/components/shared/period-selector'
import { useFinance } from '@/lib/contexts/finance-context'
import { usePreferences } from '@/lib/contexts/preferences-context'
import { paymentsDict } from '@/lib/i18n/sections/payments'
import { CreateTransactionInput } from '@/types/transaction'
import { cn } from '@/lib/utils/cn'
import { Sparkles, Loader2, Repeat, AlertTriangle, CheckSquare, Square } from 'lucide-react'

interface Suggestion {
  description: string
  amount: number
  due_date: string
  type: 'despesa' | 'transferencia' | 'investimento'
  category_id: string | null
  recurrence: 'mensal' | 'semanal' | 'anual' | 'unica'
  reason: string
}

interface AISuggestionsModalProps {
  isOpen: boolean
  onClose: () => void
}

function toISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

type PaymentsText = { [K in keyof (typeof paymentsDict)['pt']]: string }

const RECURRENCE_LABEL_KEYS: Record<Suggestion['recurrence'], keyof PaymentsText> = {
  unica: 'recurrenceLabelOnce',
  mensal: 'recurrenceLabelMonthly',
  semanal: 'recurrenceLabelWeekly',
  anual: 'recurrenceLabelYearly',
}

const EXPANSION_COUNT: Record<'mensal' | 'semanal' | 'anual', number> = {
  mensal: 12,
  semanal: 12,
  anual: 3,
}

function nextDate(baseISO: string, recurrence: Suggestion['recurrence'], step: number): string {
  const [y, m, d] = baseISO.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  if (recurrence === 'mensal') date.setMonth(date.getMonth() + step)
  else if (recurrence === 'semanal') date.setDate(date.getDate() + step * 7)
  else if (recurrence === 'anual') date.setFullYear(date.getFullYear() + step)
  const yy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

export function AISuggestionsModal({ isOpen, onClose }: AISuggestionsModalProps) {
  const { categories, bulkCreateTransactions } = useFinance()
  const { locale, t: tCommon, formatMoney } = usePreferences()
  const t = paymentsDict[locale]
  const [period, setPeriod] = useState<PeriodKey>('last-3-months')
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 3)
    return toISO(d)
  })
  const [customEnd, setCustomEnd] = useState(() => toISO(new Date()))
  const [extraPrompt, setExtraPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const range = useMemo(() => {
    if (period === 'custom') {
      return { startDate: customStart, endDate: customEnd }
    }
    const r = getDateRange(period)
    return r ? { startDate: toISO(r.startDate), endDate: toISO(r.endDate) } : null
  }, [period, customStart, customEnd])

  const categoriesById = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of categories) map.set(c.id, c.name)
    return map
  }, [categories])

  const handleGenerate = async () => {
    if (!range) {
      toast.error(t.selectValidPeriod)
      return
    }
    if (range.startDate > range.endDate) {
      toast.error(t.startBeforeEnd)
      return
    }

    setLoading(true)
    setError(null)
    setSuggestions([])
    setSelected(new Set())

    try {
      const res = await fetch('/api/payment-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: range.startDate,
          endDate: range.endDate,
          customPrompt: extraPrompt.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        const message = json?.error || t.generateSuggestionsError
        setError(message)
        toast.error(message)
        return
      }
      const list = (json.suggestions ?? []) as Suggestion[]
      setSuggestions(list)
      setSelected(new Set(list.map((_, i) => i)))
      if (list.length === 0) {
        setError(t.noRecurringFound)
      }
    } catch (err) {
      console.error(err)
      setError(t.serverError)
      toast.error(t.communicationFailed)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelected = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === suggestions.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(suggestions.map((_, i) => i)))
    }
  }

  const handleAdd = async () => {
    if (selected.size === 0) {
      toast.error(t.selectAtLeastOne)
      return
    }
    setSaving(true)
    const rows: CreateTransactionInput[] = []
    for (const idx of selected) {
      const s = suggestions[idx]
      if (!s) continue
      const isRecurring = s.recurrence !== 'unica'
      const count = isRecurring && s.recurrence !== 'unica' ? EXPANSION_COUNT[s.recurrence] : 1
      const seriesId = isRecurring && count > 1 ? crypto.randomUUID() : null

      for (let i = 0; i < count; i++) {
        const date = i === 0 ? s.due_date : nextDate(s.due_date, s.recurrence, i)
        rows.push({
          type: s.type,
          amount: s.amount,
          description: s.description,
          date,
          category_id: s.category_id || undefined,
          status: 'pendente',
          is_recurring: isRecurring,
          recurring_frequency: isRecurring ? s.recurrence : undefined,
          series_id: seriesId,
        })
      }
    }
    const { error } = await bulkCreateTransactions(rows)
    setSaving(false)
    if (error) {
      toast.error(error)
      return
    }
    toast.success(t.paymentsAdded.replace('{n}', String(rows.length)))
    onClose()
  }

  const reset = () => {
    setSuggestions([])
    setSelected(new Set())
    setError(null)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="sm:max-w-2xl">
      <ModalHeader onClose={onClose}>{t.aiSuggestionsTitle}</ModalHeader>
      <ModalContent>
        <div className="space-y-5">
          <p className="text-sm text-neutral-400">
            {t.aiSuggestionsIntro}
          </p>

          <div className="space-y-3">
            <PeriodSelector
              selected={period}
              onChange={(p) => {
                setPeriod(p)
                reset()
              }}
              showCustom
            />
            {period === 'custom' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-neutral-300 text-xs">{t.rangeStart}</Label>
                  <div className="mt-1.5">
                    <DateInput value={customStart} onChange={setCustomStart} />
                  </div>
                </div>
                <div>
                  <Label className="text-neutral-300 text-xs">{t.rangeEnd}</Label>
                  <div className="mt-1.5">
                    <DateInput value={customEnd} onChange={setCustomEnd} />
                  </div>
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="extra-prompt" className="text-neutral-300 text-xs">
                {t.extraInstructions}
              </Label>
              <textarea
                id="extra-prompt"
                value={extraPrompt}
                onChange={(e) => setExtraPrompt(e.target.value)}
                maxLength={300}
                rows={2}
                placeholder={t.extraPromptPlaceholder}
                className="flex w-full mt-1.5 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                disabled={loading}
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={loading || !range}
              className="w-full gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.analyzingTransactions}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {suggestions.length > 0 ? t.generateAgain : t.generateSuggestions}
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-orange-300">{error}</p>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={toggleAll}
                  className="flex items-center gap-2 text-xs text-neutral-300 hover:text-white"
                >
                  {selected.size === suggestions.length ? (
                    <CheckSquare className="h-4 w-4 text-primary" />
                  ) : (
                    <Square className="h-4 w-4 text-neutral-500" />
                  )}
                  {selected.size === suggestions.length
                    ? t.deselectAll
                    : t.selectAll}
                </button>
                <p className="text-xs text-neutral-500">
                  {selected.size}/{suggestions.length} {t.selectedCount}
                </p>
              </div>

              <ul className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {suggestions.map((s, idx) => {
                  const isSelected = selected.has(idx)
                  const categoryName = s.category_id
                    ? categoriesById.get(s.category_id)
                    : null
                  return (
                    <li
                      key={idx}
                      className={cn(
                        'rounded-lg border p-3 transition-colors cursor-pointer',
                        isSelected
                          ? 'border-primary/40 bg-primary/5'
                          : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-900'
                      )}
                      onClick={() => toggleSelected(idx)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 pt-0.5">
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4 text-neutral-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="text-sm font-medium text-neutral-100 truncate">
                              {s.description}
                            </p>
                            <p className="text-sm font-semibold text-red-400 tabular-nums flex-shrink-0">
                              {formatMoney(s.amount)}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            <span className="inline-flex items-center rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-300">
                              {t.dueOn} {s.due_date}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-300">
                              <Repeat className="h-2.5 w-2.5" />
                              {t[RECURRENCE_LABEL_KEYS[s.recurrence]]}
                            </span>
                            {categoryName && (
                              <span className="inline-flex items-center rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-300">
                                {categoryName}
                              </span>
                            )}
                          </div>
                          {s.reason && (
                            <p className="text-[11px] text-neutral-500 mt-1.5 italic">
                              {s.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
                  {tCommon.common.cancel}
                </Button>
                <Button
                  size="sm"
                  onClick={handleAdd}
                  disabled={saving || selected.size === 0}
                >
                  {saving
                    ? t.adding
                    : t.addItems.replace('{n}', String(selected.size))}
                </Button>
              </div>
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  )
}
