'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import {
  Upload,
  FileText,
  Loader2,
  Trash2,
  AlertCircle,
  FileUp,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  LineChart,
  Settings2,
  ChevronDown,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Modal, ModalHeader, ModalContent } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { useFinance } from '@/lib/contexts/finance-context'
import { formatCurrency } from '@/lib/utils/format-currency'
import { importedTransactionSchema } from '@/lib/utils/validation'
import { TransactionType } from '@/types/transaction'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'

type Step = 'upload' | 'processing' | 'review' | 'importing' | 'error'

interface ImportedTransaction {
  type: TransactionType
  amount: number
  description: string
  date: string
  category_id?: string | null
  external_id?: string | null
}

type NameStyle = 'padrao' | 'curto' | 'extenso' | 'completo'

interface ImportSettings {
  customPrompt: string
  ignoreWords: string
  nameStyle: NameStyle
  usePreviousMonthExamples: boolean
}

interface ImportStatementModalProps {
  isOpen: boolean
  onClose: () => void
}

const TYPE_OPTIONS = [
  { value: 'despesa', label: 'Despesa', icon: ArrowUpRight, color: 'text-red-400' },
  { value: 'receita', label: 'Receita', icon: ArrowDownLeft, color: 'text-emerald-400' },
  { value: 'investimento', label: 'Investimento', icon: LineChart, color: 'text-blue-400' },
  { value: 'transferencia', label: 'Transferência', icon: ArrowLeftRight, color: 'text-amber-400' },
] as const

const NAME_STYLE_OPTIONS: { value: NameStyle; label: string; hint: string }[] = [
  { value: 'padrao', label: 'Padrão', hint: 'Primeiro + último nome (ex: João Silva)' },
  { value: 'curto', label: 'Curto', hint: 'Apenas primeiro nome (ex: João)' },
  { value: 'extenso', label: 'Extenso', hint: 'Nome completo abreviado quando longo' },
  { value: 'completo', label: 'Completo', hint: 'Nome completo como no extrato' },
]

const SETTINGS_STORAGE_KEY = 'finance-tracker:import-statement-settings'

const DEFAULT_SETTINGS: ImportSettings = {
  customPrompt: '',
  ignoreWords: '',
  nameStyle: 'padrao',
  usePreviousMonthExamples: true,
}

function loadSettings(): ImportSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<ImportSettings>
    return {
      customPrompt: typeof parsed.customPrompt === 'string' ? parsed.customPrompt : '',
      ignoreWords: typeof parsed.ignoreWords === 'string' ? parsed.ignoreWords : '',
      nameStyle: NAME_STYLE_OPTIONS.some((o) => o.value === parsed.nameStyle)
        ? (parsed.nameStyle as NameStyle)
        : 'padrao',
      usePreviousMonthExamples:
        typeof parsed.usePreviousMonthExamples === 'boolean'
          ? parsed.usePreviousMonthExamples
          : true,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function ImportStatementModal({ isOpen, onClose }: ImportStatementModalProps) {
  const { categories, transactions: pastTransactions, bulkCreateTransactions, refetchTransactions } = useFinance()

  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [transactions, setTransactions] = useState<ImportedTransaction[]>([])
  const [error, setError] = useState<string | null>(null)
  const [statusText, setStatusText] = useState('')
  const [extractedText, setExtractedText] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [settings, setSettings] = useState<ImportSettings>(DEFAULT_SETTINGS)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  const updateSettings = useCallback((patch: Partial<ImportSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next))
        } catch {
          // ignore quota / privacy mode errors
        }
      }
      return next
    })
  }, [])

  const resetSettings = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(SETTINGS_STORAGE_KEY)
      } catch {
        // ignore
      }
    }
    setSettings(DEFAULT_SETTINGS)
  }, [])

  const previousMonthExamplesCount = useMemo(
    () => buildPreviousMonthExamples(pastTransactions).length,
    [pastTransactions]
  )

  const reset = useCallback(() => {
    setStep('upload')
    setFile(null)
    setTransactions([])
    setError(null)
    setStatusText('')
    setExtractedText(null)
    setIsDragging(false)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  const handleClose = useCallback(() => {
    reset()
    onClose()
  }, [reset, onClose])

  const callAI = useCallback(async (text: string) => {
    const controller = new AbortController()
    abortControllerRef.current = controller

    const ignoreWords = settings.ignoreWords
      .split(/[\n,]/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0)

    const examples = settings.usePreviousMonthExamples
      ? buildPreviousMonthExamples(pastTransactions)
      : []

    const response = await fetch('/api/import-statement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        categories: categories.map((c) => ({ id: c.id, name: c.name, type: c.type })),
        options: {
          customPrompt: settings.customPrompt.trim() || undefined,
          ignoreWords: ignoreWords.length > 0 ? ignoreWords : undefined,
          nameStyle: settings.nameStyle,
          examples: examples.length > 0 ? examples : undefined,
        },
      }),
      signal: controller.signal,
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Erro ao analisar extrato')

    const validTransactions: ImportedTransaction[] = []
    for (const t of data.transactions) {
      const result = importedTransactionSchema.safeParse({
        ...t,
        amount: typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount,
      })
      if (result.success) {
        validTransactions.push(result.data as ImportedTransaction)
      }
    }

    if (validTransactions.length === 0) {
      throw new Error('Nenhuma transação válida encontrada no extrato.')
    }

    // Filter out transactions with external_id that already exist in the database
    const externalIds = validTransactions
      .map((t) => t.external_id)
      .filter((id): id is string => !!id)

    if (externalIds.length > 0) {
      const supabase = createClient()
      const { data: existing } = await supabase
        .from('transactions')
        .select('external_id')
        .in('external_id', externalIds)

      if (existing && existing.length > 0) {
        const existingIds = new Set(existing.map((e) => e.external_id))
        const filtered = validTransactions.filter(
          (t) => !t.external_id || !existingIds.has(t.external_id)
        )

        if (filtered.length === 0) {
          throw new Error('Todas as transações do extrato já foram importadas anteriormente.')
        }

        return filtered
      }
    }

    return validTransactions
  }, [categories, pastTransactions, settings])

  const processFile = useCallback(async (selectedFile: File) => {
    setFile(selectedFile)
    setStep('processing')
    setError(null)

    try {
      // Step 1: Extrair texto via API server-side (pdf-parse)
      setStatusText('Extraindo texto do arquivo...')

      const formData = new FormData()
      formData.append('file', selectedFile)

      const parseResponse = await fetch('/api/parse-file', {
        method: 'POST',
        body: formData,
      })

      const parseData = await parseResponse.json()
      if (!parseResponse.ok) throw new Error(parseData.error || 'Erro ao extrair texto')

      const text = parseData.text as string
      setExtractedText(text)

      // Step 2: Analisar com IA
      setStatusText('Analisando transações com IA...')

      const validTransactions = await callAI(text)
      setTransactions(validTransactions)
      setStep('review')
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setStep('upload')
        return
      }
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setStep('error')
    }
  }, [callAI])

  const handleRetry = useCallback(async () => {
    if (!extractedText) {
      reset()
      return
    }

    setStep('processing')
    setError(null)
    setStatusText('Analisando transações com IA...')

    try {
      const validTransactions = await callAI(extractedText)
      setTransactions(validTransactions)
      setStep('review')
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setStep('upload')
        return
      }
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setStep('error')
    }
  }, [extractedText, callAI, reset])

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile && isValidFile(droppedFile)) {
        setFile(droppedFile)
        setError(null)
      }
    },
    []
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile && isValidFile(selectedFile)) {
        setFile(selectedFile)
        setError(null)
      }
      // Allow re-selecting the same file later
      e.target.value = ''
    },
    []
  )

  const handleContinue = useCallback(() => {
    if (!file) return
    processFile(file)
  }, [file, processFile])

  const handleClearFile = useCallback(() => {
    setFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const updateTransaction = useCallback((index: number, field: keyof ImportedTransaction, value: string | number) => {
    setTransactions((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    )
  }, [])

  const removeTransaction = useCallback((index: number) => {
    setTransactions((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleImport = useCallback(async () => {
    if (transactions.length === 0) return

    setStep('importing')
    const count = transactions.length

    const inputs = transactions.map((t) => ({
      type: t.type,
      amount: t.amount,
      description: t.description,
      date: t.date,
      category_id: t.category_id || undefined,
      external_id: t.external_id || undefined,
      status: 'concluida' as const,
    }))

    const { error } = await bulkCreateTransactions(inputs)

    if (error) {
      toast.error('Erro ao importar transações', {
        description: error,
      })
      setError(error)
      setStep('error')
      return
    }

    await refetchTransactions()
    toast.success(
      count === 1
        ? '1 transação importada'
        : `${count} transações importadas`,
      { description: 'O extrato foi processado com sucesso.' }
    )
    reset()
    onClose()
  }, [transactions, bulkCreateTransactions, refetchTransactions, reset, onClose])

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    reset()
  }, [reset])

  const summary = transactions.reduce(
    (acc, t) => {
      if (t.type === 'receita') acc.income += t.amount
      else acc.expenses += t.amount
      return acc
    },
    { income: 0, expenses: 0 }
  )

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="sm:max-w-4xl">
      <ModalHeader onClose={handleClose}>
        Importar Extrato Bancário
      </ModalHeader>
      <ModalContent>
        {/* ── UPLOAD ── */}
        {step === 'upload' && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!file ? (
              <div
                className={cn(
                  'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 sm:p-14 text-center transition-colors cursor-pointer',
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-neutral-700 bg-neutral-900/50 hover:border-neutral-500 hover:bg-neutral-800/40'
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={cn(
                  'flex items-center justify-center h-14 w-14 rounded-2xl mb-5 transition-colors',
                  isDragging ? 'bg-primary/15' : 'bg-neutral-800'
                )}>
                  <FileUp className={cn(
                    'h-7 w-7 transition-colors',
                    isDragging ? 'text-primary' : 'text-neutral-400'
                  )} />
                </div>
                <p className="text-base font-medium text-neutral-200 mb-1.5">
                  {isDragging ? 'Solte o arquivo aqui' : 'Arraste seu extrato aqui'}
                </p>
                <p className="text-sm text-neutral-500 mb-4">
                  ou clique para selecionar
                </p>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-400">
                    <FileText className="h-3 w-3" />
                    CSV
                  </span>
                  <span className="text-xs text-neutral-600">máx. 10MB</span>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-4 transition-colors',
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-neutral-800 bg-neutral-900/50'
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
              >
                <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-primary/15 flex-shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-200 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {formatFileSize(file.size)} · pronto para importar
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-neutral-400 hover:text-neutral-200 px-2 py-1 rounded-md hover:bg-neutral-800 transition-colors"
                >
                  Trocar
                </button>
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="p-1.5 rounded-md text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  aria-label="Remover arquivo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Settings panel */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
              <button
                type="button"
                onClick={() => setSettingsOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-neutral-800/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-neutral-800">
                    <Settings2 className="h-4 w-4 text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-200">
                      Configurações de importação
                    </p>
                    <p className="text-xs text-neutral-500">
                      Personalize como a IA processa o extrato
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-neutral-500 transition-transform',
                    settingsOpen && 'rotate-180'
                  )}
                />
              </button>

              {settingsOpen && (
                <div className="px-4 pb-4 pt-1 space-y-4 border-t border-neutral-800">
                  {/* Previous month examples */}
                  <label
                    htmlFor="import-examples-checkbox"
                    className={cn(
                      'flex items-start gap-3 select-none rounded-lg border border-neutral-800 bg-neutral-900/50 p-3 transition-colors',
                      previousMonthExamplesCount > 0
                        ? 'cursor-pointer hover:border-neutral-700'
                        : 'cursor-not-allowed opacity-60'
                    )}
                  >
                    <input
                      id="import-examples-checkbox"
                      type="checkbox"
                      checked={settings.usePreviousMonthExamples && previousMonthExamplesCount > 0}
                      disabled={previousMonthExamplesCount === 0}
                      onChange={(e) =>
                        updateSettings({ usePreviousMonthExamples: e.target.checked })
                      }
                      className="mt-0.5 h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-primary focus:ring-1 focus:ring-primary focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-200">
                        Usar transações do mês anterior como exemplos
                      </p>
                      <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight">
                        {previousMonthExamplesCount > 0
                          ? `${previousMonthExamplesCount} ${previousMonthExamplesCount === 1 ? 'transação encontrada' : 'transações encontradas'} para guiar a IA na escolha de categorias e nomes.`
                          : 'Nenhuma transação do mês anterior disponível.'}
                      </p>
                    </div>
                  </label>

                  {/* Name style */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">
                      Estilo do nome em transferências
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {NAME_STYLE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => updateSettings({ nameStyle: opt.value })}
                          className={cn(
                            'text-left rounded-lg border px-3 py-2 transition-colors',
                            settings.nameStyle === opt.value
                              ? 'border-primary bg-primary/10'
                              : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                          )}
                        >
                          <p className={cn(
                            'text-sm font-medium',
                            settings.nameStyle === opt.value ? 'text-primary' : 'text-neutral-200'
                          )}>
                            {opt.label}
                          </p>
                          <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight">
                            {opt.hint}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ignore words */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="import-ignore-words"
                      className="text-xs font-medium text-neutral-300"
                    >
                      Palavras a ignorar
                    </label>
                    <input
                      id="import-ignore-words"
                      type="text"
                      value={settings.ignoreWords}
                      onChange={(e) => updateSettings({ ignoreWords: e.target.value })}
                      placeholder="ex: saldo anterior, rendimento, IOF"
                      className="w-full h-10 rounded-md border border-neutral-800 bg-neutral-900 px-3 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                    <p className="text-[11px] text-neutral-500">
                      Separe por vírgula. Transações que contenham essas palavras serão descartadas.
                    </p>
                  </div>

                  {/* Custom prompt */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="import-custom-prompt"
                      className="text-xs font-medium text-neutral-300"
                    >
                      Instruções adicionais para a IA
                    </label>
                    <textarea
                      id="import-custom-prompt"
                      value={settings.customPrompt}
                      onChange={(e) => updateSettings({ customPrompt: e.target.value })}
                      rows={3}
                      placeholder='ex: "Toda transação contendo Uber deve virar despesa de transporte", "Aplicações em CDB são investimentos"'
                      className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-y"
                    />
                    <p className="text-[11px] text-neutral-500">
                      Essas instruções são adicionadas ao prompt enviado à IA.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[11px] text-neutral-600">
                      As preferências ficam salvas neste navegador.
                    </p>
                    <button
                      type="button"
                      onClick={resetSettings}
                      className="text-[11px] text-neutral-400 hover:text-neutral-200 underline-offset-2 hover:underline"
                    >
                      Restaurar padrões
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <Button variant="ghost" size="sm" onClick={handleClose} className="px-4">
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleContinue}
                disabled={!file}
                className="px-6 gap-1.5"
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* ── PROCESSING ── */}
        {step === 'processing' && (
          <div className="flex flex-col items-center py-14 gap-5">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            </div>
            <div className="text-center space-y-1.5">
              <p className="text-base font-medium text-neutral-200">{statusText}</p>
              {file && (
                <p className="text-sm text-neutral-500 flex items-center justify-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  {file.name}
                </p>
              )}
              <p className="text-xs text-neutral-600">Isso pode levar alguns minutos</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="mt-1 text-neutral-400 hover:text-neutral-200"
            >
              Cancelar
            </Button>
          </div>
        )}

        {/* ── ERROR ── */}
        {step === 'error' && (
          <div className="flex flex-col items-center py-12 gap-5">
            <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <div className="text-center space-y-1.5 max-w-sm">
              <p className="text-base font-medium text-neutral-200">Erro ao processar extrato</p>
              <p className="text-sm text-neutral-400">{error}</p>
            </div>
            <div className="flex gap-3 mt-1">
              <Button variant="outline" size="sm" onClick={handleRetry} className="gap-1.5">
                Tentar Novamente
              </Button>
              <Button variant="ghost" size="sm" onClick={reset}>
                Voltar
              </Button>
            </div>
          </div>
        )}

        {/* ── REVIEW ── */}
        {step === 'review' && (
          <div className="space-y-4">
            {/* Summary bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3">
                <p className="text-[10px] sm:text-xs font-medium text-neutral-500">Encontradas</p>
                <p className="text-base sm:text-lg font-bold text-white mt-0.5 tabular-nums">
                  {transactions.length}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                <p className="text-[10px] sm:text-xs font-medium text-neutral-500">Receitas</p>
                <p className="text-base sm:text-lg font-bold text-emerald-400 mt-0.5 truncate tabular-nums">
                  {formatCurrency(summary.income)}
                </p>
              </div>
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                <p className="text-[10px] sm:text-xs font-medium text-neutral-500">Despesas</p>
                <p className="text-base sm:text-lg font-bold text-red-400 mt-0.5 truncate tabular-nums">
                  {formatCurrency(summary.expenses)}
                </p>
              </div>
            </div>

            {/* Editable table */}
            <div className="rounded-xl border border-neutral-800 overflow-hidden">
              <div className="max-h-[45vh] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-900/80 sticky top-0 z-10">
                    <tr className="border-b border-neutral-800">
                      <th className="text-left px-3 py-2.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="text-left px-3 py-2.5 text-xs font-medium text-neutral-500 uppercase tracking-wider w-[120px] hidden sm:table-cell">
                        Data
                      </th>
                      <th className="text-left px-3 py-2.5 text-xs font-medium text-neutral-500 uppercase tracking-wider w-[130px] hidden md:table-cell">
                        Tipo
                      </th>
                      <th className="text-left px-3 py-2.5 text-xs font-medium text-neutral-500 uppercase tracking-wider w-[150px] hidden lg:table-cell">
                        Categoria
                      </th>
                      <th className="text-right px-3 py-2.5 text-xs font-medium text-neutral-500 uppercase tracking-wider w-[110px]">
                        Valor
                      </th>
                      <th className="px-2 py-2.5 w-[40px]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/50">
                    {transactions.map((t, i) => {
                      const typeOption = TYPE_OPTIONS.find((o) => o.value === t.type)
                      const TypeIcon = typeOption?.icon || ArrowUpRight

                      return (
                        <tr key={i} className="group hover:bg-neutral-800/30 transition-colors">
                          {/* Description */}
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2.5">
                              <div className={cn(
                                'flex items-center justify-center h-8 w-8 rounded-lg flex-shrink-0',
                                t.type === 'receita' ? 'bg-emerald-500/15' :
                                t.type === 'investimento' ? 'bg-blue-500/15' :
                                t.type === 'transferencia' ? 'bg-amber-500/15' :
                                'bg-red-500/15'
                              )}>
                                <TypeIcon className={cn('h-4 w-4', typeOption?.color || 'text-red-400')} />
                              </div>
                              <input
                                type="text"
                                value={t.description}
                                onChange={(e) => updateTransaction(i, 'description', e.target.value)}
                                className="w-full min-w-0 bg-transparent text-sm text-neutral-200 border-0 outline-none focus:ring-0 placeholder:text-neutral-600 truncate"
                              />
                            </div>
                            {/* Mobile: show date + type below */}
                            <div className="flex items-center gap-2 mt-1 sm:hidden">
                              <span className="text-xs text-neutral-500">{t.date}</span>
                              <span className={cn('text-xs', typeOption?.color)}>{typeOption?.label}</span>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="px-3 py-2 hidden sm:table-cell">
                            <input
                              type="date"
                              value={t.date}
                              onChange={(e) => updateTransaction(i, 'date', e.target.value)}
                              className="w-full bg-transparent text-sm text-neutral-300 border-0 outline-none focus:ring-0 [color-scheme:dark]"
                            />
                          </td>

                          {/* Type */}
                          <td className="px-3 py-2 hidden md:table-cell">
                            <select
                              value={t.type}
                              onChange={(e) => updateTransaction(i, 'type', e.target.value)}
                              className="w-full h-8 rounded-md border border-neutral-700 bg-neutral-800 px-2 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              {TYPE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Category */}
                          <td className="px-3 py-2 hidden lg:table-cell">
                            <select
                              value={t.category_id || ''}
                              onChange={(e) => updateTransaction(i, 'category_id', e.target.value)}
                              className="w-full h-8 rounded-md border border-neutral-700 bg-neutral-800 px-2 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value="">Sem categoria</option>
                              {categories
                                .filter((c) => c.type === t.type)
                                .map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}
                                  </option>
                                ))}
                            </select>
                          </td>

                          {/* Amount */}
                          <td className="px-3 py-2 text-right">
                            <span className={cn(
                              'text-sm font-semibold tabular-nums',
                              t.type === 'receita' ? 'text-emerald-400' :
                              t.type === 'investimento' ? 'text-blue-400' :
                              'text-red-400'
                            )}>
                              {t.type === 'receita' ? '+' : '-'}
                              {formatCurrency(t.amount)}
                            </span>
                          </td>

                          {/* Delete */}
                          <td className="px-2 py-2">
                            <button
                              onClick={() => removeTransaction(i)}
                              className="p-1.5 rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
              <p className="text-xs text-neutral-500">
                {file?.name}
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" size="sm" onClick={handleClose} className="px-4">
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleImport}
                  disabled={transactions.length === 0}
                  className="px-4 sm:px-6 gap-1.5"
                >
                  <Upload className="h-4 w-4" />
                  Importar {transactions.length} transações
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── IMPORTING ── */}
        {step === 'importing' && (
          <div className="flex flex-col items-center py-14 gap-5">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <div className="text-center space-y-1.5">
              <p className="text-base font-medium text-neutral-200">
                Importando transações...
              </p>
              <p className="text-sm text-neutral-500">
                {transactions.length} transações sendo criadas
              </p>
            </div>
            <div className="w-full max-w-xs">
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-pulse w-full" />
              </div>
            </div>
          </div>
        )}

      </ModalContent>
    </Modal>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function getPreviousMonthRange(now: Date = new Date()): { start: string; end: string } {
  const year = now.getFullYear()
  const month = now.getMonth() // 0-11, current
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0) // last day of previous month
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return { start: fmt(start), end: fmt(end) }
}

interface PastTransactionLike {
  date: string
  description: string
  type: string
  category_id: string | null
  category?: { id: string; name: string } | null
}

function buildPreviousMonthExamples(transactions: PastTransactionLike[]) {
  const { start, end } = getPreviousMonthRange()
  const seen = new Set<string>()
  const examples: {
    description: string
    type: string
    category_id: string | null
    category_name: string | null
  }[] = []
  for (const t of transactions) {
    if (!t.date || t.date < start || t.date > end) continue
    if (!t.description || t.description.trim().length === 0) continue
    const key = `${t.description.toLowerCase()}|${t.category_id ?? ''}`
    if (seen.has(key)) continue
    seen.add(key)
    examples.push({
      description: t.description,
      type: t.type,
      category_id: t.category_id ?? null,
      category_name: t.category?.name ?? null,
    })
    if (examples.length >= 80) break
  }
  return examples
}

function isValidFile(file: File): boolean {
  const maxSize = 10 * 1024 * 1024

  const hasValidExtension = file.name.toLowerCase().endsWith('.csv')

  if (!hasValidExtension) {
    alert('Formato inválido. Use CSV.')
    return false
  }

  if (file.size > maxSize) {
    alert('Arquivo muito grande. O limite é 10MB.')
    return false
  }

  return true
}
