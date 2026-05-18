'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/shared/skeleton'
import { PeriodSelector, getDateRange, PeriodKey } from '@/components/shared/period-selector'
import { PaymentModal } from '@/components/payments/payment-modal'
import { AISuggestionsModal } from '@/components/payments/ai-suggestions-modal'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useFinance } from '@/lib/contexts/finance-context'
import { TransactionWithCategory } from '@/types/transaction'
import { formatCurrency } from '@/lib/utils/format-currency'
import { cn } from '@/lib/utils/cn'
import {
  Plus,
  Sparkles,
  Receipt,
  Check,
  AlertTriangle,
  Calendar,
  Pencil,
  Trash2,
  RotateCcw,
  Wallet,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Layers,
} from 'lucide-react'

function toISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function daysBetween(aISO: string, bISO: string): number {
  const a = new Date(aISO + 'T00:00:00')
  const b = new Date(bISO + 'T00:00:00')
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

const PAYMENT_TYPES = new Set(['despesa', 'transferencia', 'investimento'])

type Group =
  | { kind: 'single'; tx: TransactionWithCategory }
  | {
      kind: 'series'
      seriesId: string
      rep: TransactionWithCategory
      others: TransactionWithCategory[]
      total: number
    }

function groupBySeries(
  list: TransactionWithCategory[],
  representative: 'earliest' | 'latest'
): Group[] {
  const seriesMap = new Map<string, TransactionWithCategory[]>()
  const singles: TransactionWithCategory[] = []

  for (const tx of list) {
    if (!tx.series_id) {
      singles.push(tx)
      continue
    }
    const arr = seriesMap.get(tx.series_id) ?? []
    arr.push(tx)
    seriesMap.set(tx.series_id, arr)
  }

  const groups: Group[] = []

  for (const [seriesId, arr] of seriesMap.entries()) {
    if (arr.length === 1) {
      singles.push(arr[0])
      continue
    }
    const sorted = [...arr].sort((a, b) => a.date.localeCompare(b.date))
    const rep =
      representative === 'earliest' ? sorted[0] : sorted[sorted.length - 1]
    const others = sorted.filter((t) => t.id !== rep.id)
    groups.push({ kind: 'series', seriesId, rep, others, total: arr.length })
  }

  for (const single of singles) {
    groups.push({ kind: 'single', tx: single })
  }

  groups.sort((a, b) => {
    const da = a.kind === 'single' ? a.tx.date : a.rep.date
    const db = b.kind === 'single' ? b.tx.date : b.rep.date
    return representative === 'earliest'
      ? da.localeCompare(db)
      : db.localeCompare(da)
  })

  return groups
}

export default function PaymentAssistantPage() {
  const {
    transactions,
    transactionsLoading,
    updateTransaction,
    deleteTransaction,
    deleteSeries,
  } = useFinance()
  const [period, setPeriod] = useState<PeriodKey>('this-month')
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<TransactionWithCategory | null>(null)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set())
  const confirm = useConfirm()

  const today = useMemo(() => toISO(new Date()), [])

  const dateRange = useMemo(() => {
    const r = getDateRange(period)
    if (!r) return null
    return { start: toISO(r.startDate), end: toISO(r.endDate) }
  }, [period])

  const { pending, paid, pendingGroups, paidGroups } = useMemo(() => {
    const payments = transactions.filter((t) => PAYMENT_TYPES.has(t.type))
    const pendingList = payments
      .filter((t) => t.status === 'pendente')
      .sort((a, b) => a.date.localeCompare(b.date))

    const paidList = payments
      .filter((t) => {
        if (t.status !== 'concluida') return false
        if (!dateRange) return true
        return t.date >= dateRange.start && t.date <= dateRange.end
      })
      .sort((a, b) => b.date.localeCompare(a.date))

    return {
      pending: pendingList,
      paid: paidList,
      pendingGroups: groupBySeries(pendingList, 'earliest'),
      paidGroups: groupBySeries(paidList, 'latest'),
    }
  }, [transactions, dateRange])

  const stats = useMemo(() => {
    const totalPending = pending.reduce((s, t) => s + Number(t.amount), 0)
    const overdue = pending.filter((t) => t.date < today)
    const totalOverdue = overdue.reduce((s, t) => s + Number(t.amount), 0)
    const totalPaid = paid.reduce((s, t) => s + Number(t.amount), 0)
    const upcomingWeek = pending.filter((t) => {
      const diff = daysBetween(today, t.date)
      return diff >= 0 && diff <= 7
    })
    const totalUpcomingWeek = upcomingWeek.reduce(
      (s, t) => s + Number(t.amount),
      0
    )

    return {
      totalPending,
      pendingCount: pending.length,
      overdueCount: overdue.length,
      totalOverdue,
      totalPaid,
      paidCount: paid.length,
      upcomingWeekCount: upcomingWeek.length,
      totalUpcomingWeek,
    }
  }, [pending, paid, today])

  const toggleSeries = (seriesId: string) => {
    setExpandedSeries((prev) => {
      const next = new Set(prev)
      if (next.has(seriesId)) next.delete(seriesId)
      else next.add(seriesId)
      return next
    })
  }

  const handleMarkAsPaid = async (payment: TransactionWithCategory) => {
    setUpdatingId(payment.id)
    const { error } = await updateTransaction(payment.id, { status: 'concluida' })
    setUpdatingId(null)
    if (error) {
      toast.error(error)
      return
    }
    toast.success('Pagamento marcado como pago')
  }

  const handleRevert = async (payment: TransactionWithCategory) => {
    setUpdatingId(payment.id)
    const { error } = await updateTransaction(payment.id, { status: 'pendente' })
    setUpdatingId(null)
    if (error) {
      toast.error(error)
      return
    }
    toast.success('Pagamento marcado como pendente')
  }

  const handleDelete = async (payment: TransactionWithCategory) => {
    const ok = await confirm({
      title: 'Excluir pagamento?',
      description: `"${payment.description}" será removido. Esta ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      variant: 'destructive',
    })
    if (!ok) return
    setUpdatingId(payment.id)
    const { error } = await deleteTransaction(payment.id)
    setUpdatingId(null)
    if (error) {
      toast.error(error)
      return
    }
    toast.success('Pagamento excluído')
  }

  const handleDeleteSeries = async (seriesId: string, description: string) => {
    const ok = await confirm({
      title: 'Excluir série completa?',
      description: (
        <>
          Todas as ocorrências de <strong>&quot;{description}&quot;</strong> serão removidas.
          Esta ação não pode ser desfeita.
        </>
      ),
      confirmLabel: 'Excluir tudo',
      variant: 'destructive',
    })
    if (!ok) return
    setUpdatingId(seriesId)
    const { count, error } = await deleteSeries(seriesId)
    setUpdatingId(null)
    if (error) {
      toast.error(error)
      return
    }
    setExpandedSeries((prev) => {
      const next = new Set(prev)
      next.delete(seriesId)
      return next
    })
    toast.success(`${count} ocorrência(s) excluída(s)`)
  }

  const handleEdit = (payment: TransactionWithCategory) => {
    setEditingPayment(payment)
    setPaymentModalOpen(true)
  }

  const handleNew = () => {
    setEditingPayment(null)
    setPaymentModalOpen(true)
  }

  if (transactionsLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-cyan-500/15 p-1.5">
              <Receipt className="h-5 w-5 text-cyan-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Assistente de Pagamentos
            </h1>
          </div>
          <p className="text-neutral-400 text-sm mt-1">
            Acompanhe contas a pagar, recorrências e marque o que já foi pago.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={() => setSuggestionsOpen(true)}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="hidden sm:inline">Sugerir com IA</span>
            <span className="sm:hidden">IA</span>
          </Button>
          <Button onClick={handleNew} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo pagamento</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="A pagar"
          value={formatCurrency(stats.totalPending)}
          meta={`${stats.pendingCount} item(ns)`}
          icon={Wallet}
          color="cyan"
        />
        <StatCard
          label="Vencidos"
          value={formatCurrency(stats.totalOverdue)}
          meta={`${stats.overdueCount} item(ns)`}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          label="Próximos 7 dias"
          value={formatCurrency(stats.totalUpcomingWeek)}
          meta={`${stats.upcomingWeekCount} item(ns)`}
          icon={Clock}
          color="orange"
        />
        <StatCard
          label="Pagos (período)"
          value={formatCurrency(stats.totalPaid)}
          meta={`${stats.paidCount} item(ns)`}
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      <Card>
        <CardHeader className="px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-cyan-500/15 p-1.5">
              <Calendar className="h-4 w-4 text-cyan-400" />
            </div>
            <CardTitle className="text-base sm:text-lg">
              Pendentes ({pending.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {pendingGroups.length === 0 ? (
            <EmptyMessage
              icon={CheckCircle2}
              title="Tudo em dia!"
              description="Nenhum pagamento pendente. Use o botão acima para agendar ou pedir sugestões à IA."
            />
          ) : (
            <ul className="space-y-2">
              {pendingGroups.map((g) =>
                g.kind === 'single' ? (
                  <li key={g.tx.id}>
                    <PaymentRow
                      payment={g.tx}
                      today={today}
                      isUpdating={updatingId === g.tx.id}
                      variant="pending"
                      onMarkPaid={() => handleMarkAsPaid(g.tx)}
                      onEdit={() => handleEdit(g.tx)}
                      onDelete={() => handleDelete(g.tx)}
                    />
                  </li>
                ) : (
                  <SeriesGroup
                    key={g.seriesId}
                    group={g}
                    today={today}
                    expanded={expandedSeries.has(g.seriesId)}
                    onToggle={() => toggleSeries(g.seriesId)}
                    updatingId={updatingId}
                    variant="pending"
                    onMarkPaid={handleMarkAsPaid}
                    onRevert={handleRevert}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDeleteSeries={() =>
                      handleDeleteSeries(g.seriesId, g.rep.description)
                    }
                  />
                )
              )}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-emerald-500/15 p-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <CardTitle className="text-base sm:text-lg">
                Pagos ({paid.length})
              </CardTitle>
            </div>
            <PeriodSelector selected={period} onChange={setPeriod} />
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {paidGroups.length === 0 ? (
            <EmptyMessage
              icon={Receipt}
              title="Nenhum pagamento concluído no período"
              description="Marque pagamentos como pagos para acompanhar o histórico."
            />
          ) : (
            <ul className="space-y-2">
              {paidGroups.map((g) =>
                g.kind === 'single' ? (
                  <li key={g.tx.id}>
                    <PaymentRow
                      payment={g.tx}
                      today={today}
                      isUpdating={updatingId === g.tx.id}
                      variant="paid"
                      onRevert={() => handleRevert(g.tx)}
                      onEdit={() => handleEdit(g.tx)}
                      onDelete={() => handleDelete(g.tx)}
                    />
                  </li>
                ) : (
                  <SeriesGroup
                    key={g.seriesId}
                    group={g}
                    today={today}
                    expanded={expandedSeries.has(g.seriesId)}
                    onToggle={() => toggleSeries(g.seriesId)}
                    updatingId={updatingId}
                    variant="paid"
                    onMarkPaid={handleMarkAsPaid}
                    onRevert={handleRevert}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDeleteSeries={() =>
                      handleDeleteSeries(g.seriesId, g.rep.description)
                    }
                  />
                )
              )}
            </ul>
          )}
        </CardContent>
      </Card>

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false)
          setEditingPayment(null)
        }}
        editingPayment={editingPayment}
      />
      <AISuggestionsModal
        isOpen={suggestionsOpen}
        onClose={() => setSuggestionsOpen(false)}
      />
    </div>
  )
}

type ColorKey = 'cyan' | 'red' | 'orange' | 'emerald'
const COLOR_MAP: Record<ColorKey, { border: string; bg: string; text: string }> = {
  cyan: {
    border: 'border-cyan-500/20',
    bg: 'bg-cyan-500/5',
    text: 'text-cyan-400',
  },
  red: { border: 'border-red-500/20', bg: 'bg-red-500/5', text: 'text-red-400' },
  orange: {
    border: 'border-orange-500/20',
    bg: 'bg-orange-500/5',
    text: 'text-orange-400',
  },
  emerald: {
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
    text: 'text-emerald-400',
  },
}

function StatCard({
  label,
  value,
  meta,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  meta: string
  icon: React.ComponentType<{ className?: string }>
  color: ColorKey
}) {
  const c = COLOR_MAP[color]
  return (
    <div className={cn('rounded-xl border p-3 sm:p-4', c.border, c.bg)}>
      <div className="flex items-center gap-1.5">
        <Icon className={cn('h-3.5 w-3.5', c.text)} />
        <p className="text-[10px] sm:text-xs font-medium text-neutral-400">{label}</p>
      </div>
      <p
        className={cn('text-sm sm:text-lg font-bold mt-1 truncate tabular-nums', c.text)}
      >
        {value}
      </p>
      <p className="text-[10px] text-neutral-500 mt-0.5">{meta}</p>
    </div>
  )
}

interface SeriesGroupProps {
  group: Extract<Group, { kind: 'series' }>
  today: string
  expanded: boolean
  onToggle: () => void
  updatingId: string | null
  variant: 'pending' | 'paid'
  onMarkPaid: (p: TransactionWithCategory) => void
  onRevert: (p: TransactionWithCategory) => void
  onEdit: (p: TransactionWithCategory) => void
  onDelete: (p: TransactionWithCategory) => void
  onDeleteSeries: () => void
}

function SeriesGroup({
  group,
  today,
  expanded,
  onToggle,
  updatingId,
  variant,
  onMarkPaid,
  onRevert,
  onEdit,
  onDelete,
  onDeleteSeries,
}: SeriesGroupProps) {
  const { rep, others, total, seriesId } = group
  const isSeriesUpdating = updatingId === seriesId

  return (
    <li className="rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900/40">
      <PaymentRow
        payment={rep}
        today={today}
        isUpdating={updatingId === rep.id}
        variant={variant}
        onMarkPaid={variant === 'pending' ? () => onMarkPaid(rep) : undefined}
        onRevert={variant === 'paid' ? () => onRevert(rep) : undefined}
        onEdit={() => onEdit(rep)}
        onDelete={() => onDelete(rep)}
        seriesBadge={{ total, expanded, onToggle }}
        bare
      />

      {expanded && others.length > 0 && (
        <div className="border-t border-neutral-800 bg-neutral-950/40">
          <ul className="divide-y divide-neutral-800/60">
            {others.map((p) => (
              <li key={p.id}>
                <PaymentRow
                  payment={p}
                  today={today}
                  isUpdating={updatingId === p.id}
                  variant={variant}
                  onMarkPaid={variant === 'pending' ? () => onMarkPaid(p) : undefined}
                  onRevert={variant === 'paid' ? () => onRevert(p) : undefined}
                  onEdit={() => onEdit(p)}
                  onDelete={() => onDelete(p)}
                  compact
                  bare
                />
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 border-t border-neutral-800/60 bg-neutral-900/40">
            <p className="text-[11px] text-neutral-500">
              Série recorrente • {total} ocorrências
            </p>
            <button
              type="button"
              onClick={onDeleteSeries}
              disabled={isSeriesUpdating}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Excluir série completa
            </button>
          </div>
        </div>
      )}
    </li>
  )
}

interface PaymentRowProps {
  payment: TransactionWithCategory
  today: string
  isUpdating: boolean
  variant: 'pending' | 'paid'
  onMarkPaid?: () => void
  onRevert?: () => void
  onEdit: () => void
  onDelete: () => void
  seriesBadge?: { total: number; expanded: boolean; onToggle: () => void }
  compact?: boolean
  bare?: boolean
}

function PaymentRow({
  payment,
  today,
  isUpdating,
  variant,
  onMarkPaid,
  onRevert,
  onEdit,
  onDelete,
  seriesBadge,
  compact = false,
  bare = false,
}: PaymentRowProps) {
  const isOverdue = variant === 'pending' && payment.date < today
  const diff = daysBetween(today, payment.date)

  let dateBadge = formatDateBR(payment.date)
  let badgeClass = 'bg-neutral-800 text-neutral-300'
  if (variant === 'pending') {
    if (isOverdue) {
      dateBadge = `Venceu ${formatDateBR(payment.date)}`
      badgeClass = 'bg-red-500/15 text-red-400'
    } else if (diff === 0) {
      dateBadge = 'Vence hoje'
      badgeClass = 'bg-orange-500/15 text-orange-400'
    } else if (diff <= 7) {
      dateBadge = `Vence em ${diff} dia${diff === 1 ? '' : 's'}`
      badgeClass = 'bg-amber-500/15 text-amber-400'
    } else {
      dateBadge = `Vence ${formatDateBR(payment.date)}`
    }
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 transition-colors',
        !bare && 'rounded-lg border',
        !bare &&
          (variant === 'pending'
            ? isOverdue
              ? 'border-red-500/20 bg-red-500/[0.03]'
              : 'border-neutral-800 bg-neutral-900/60'
            : 'border-neutral-800 bg-neutral-900/40'),
        compact && 'py-2'
      )}
    >
      {variant === 'pending' ? (
        <button
          type="button"
          onClick={onMarkPaid}
          disabled={isUpdating || !onMarkPaid}
          className={cn(
            'flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all',
            compact ? 'h-7 w-7' : 'h-9 w-9',
            'hover:bg-emerald-500/10 hover:border-emerald-500',
            'border-neutral-700 text-neutral-500 hover:text-emerald-400',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label="Marcar como pago"
          title="Marcar como pago"
        >
          <Check className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
        </button>
      ) : (
        <div
          className={cn(
            'flex-shrink-0 rounded-full bg-emerald-500/15 flex items-center justify-center',
            compact ? 'h-7 w-7' : 'h-9 w-9'
          )}
        >
          <CheckCircle2 className={compact ? 'h-3 w-3 text-emerald-400' : 'h-4 w-4 text-emerald-400'} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={cn(
              'font-medium truncate',
              compact ? 'text-xs' : 'text-sm',
              variant === 'paid' ? 'text-neutral-400' : 'text-neutral-100'
            )}
          >
            {payment.description}
          </p>
          <p
            className={cn(
              'font-semibold tabular-nums flex-shrink-0',
              compact ? 'text-xs' : 'text-sm',
              variant === 'paid' ? 'text-neutral-400' : 'text-red-400'
            )}
          >
            {formatCurrency(Number(payment.amount))}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-[10px]',
              badgeClass
            )}
          >
            {dateBadge}
          </span>
          {payment.category && (
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px]"
              style={{
                backgroundColor: payment.category.color
                  ? `${payment.category.color}20`
                  : '#262626',
                color: payment.category.color || '#d4d4d4',
              }}
            >
              {payment.category.name}
            </span>
          )}
          {seriesBadge ? (
            <button
              type="button"
              onClick={seriesBadge.onToggle}
              className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 transition-colors px-2 py-0.5 text-[10px] font-medium"
            >
              {seriesBadge.expanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              <Layers className="h-2.5 w-2.5" />
              {seriesBadge.total} ocorrências
            </button>
          ) : payment.is_recurring && !compact ? (
            <span className="inline-flex items-center rounded-full bg-purple-500/15 text-purple-300 px-2 py-0.5 text-[10px]">
              Recorrente
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {variant === 'paid' && onRevert && (
          <button
            type="button"
            onClick={onRevert}
            disabled={isUpdating}
            className="p-1.5 text-neutral-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-md transition-colors disabled:opacity-50"
            title="Marcar como pendente"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onEdit}
          disabled={isUpdating}
          className="p-1.5 text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 rounded-md transition-colors disabled:opacity-50"
          title="Editar"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isUpdating}
          className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
          title="Excluir"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function EmptyMessage({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="py-10 flex flex-col items-center text-center gap-2">
      <div className="rounded-full bg-neutral-800/60 p-3">
        <Icon className="h-6 w-6 text-neutral-500" />
      </div>
      <p className="text-sm font-medium text-neutral-300">{title}</p>
      <p className="text-xs text-neutral-500 max-w-sm">{description}</p>
    </div>
  )
}
