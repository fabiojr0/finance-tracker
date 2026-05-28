'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowDownLeft, ArrowUpRight, LineChart, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useFinance } from '@/lib/contexts/finance-context'
import { usePreferences } from '@/lib/contexts/preferences-context'
import { sharedDict } from '@/lib/i18n/sections/shared'
import { cn } from '@/lib/utils/cn'
import { CategoryIcon } from './category-icon'

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

// Parse an ISO date-only string (yyyy-mm-dd) as a local date to avoid the
// UTC-midnight off-by-one shift in negative-offset timezones.
function formatLocalizedDate(iso: string, localeTag: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return iso
  return new Date(year, month - 1, day).toLocaleDateString(localeTag)
}

interface GlobalSearchProps {
  isMobile?: boolean
  onClose?: () => void
}

export function GlobalSearch({ isMobile, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { transactions, categories } = useFinance()
  const { locale, formatMoney, localeTag, t: tCommon } = usePreferences()
  const t = sharedDict[locale]

  const results = useMemo(() => query.length >= 2
    ? transactions
        .filter((tx) => {
          const searchNormalized = normalizeText(query)
          const matchDescription = normalizeText(tx.description).includes(searchNormalized)
          const matchCategory = tx.category?.name && normalizeText(tx.category.name).includes(searchNormalized)
          const matchAmount = formatMoney(tx.amount).includes(query)
          return matchDescription || matchCategory || matchAmount
        })
        .slice(0, 8)
    : [], [query, transactions, formatMoney])

  const categoryResults = useMemo(() => query.length >= 2
    ? categories
        .filter((c) => normalizeText(c.name).includes(normalizeText(query)))
        .slice(0, 3)
    : [], [query, categories])

  const hasResults = results.length > 0 || categoryResults.length > 0

  const handleSelect = useCallback((transactionId?: string, categoryId?: string) => {
    if (transactionId) {
      router.push(`/transacoes?id=${transactionId}`)
    } else if (categoryId) {
      router.push(`/categorias?id=${categoryId}`)
    }
    setQuery('')
    setIsOpen(false)
    onClose?.()
  }, [router, onClose])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const totalResults = results.length + categoryResults.length

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % totalResults)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + totalResults) % totalResults)
    } else if (e.key === 'Enter' && hasResults) {
      e.preventDefault()
      if (selectedIndex < results.length) {
        handleSelect(results[selectedIndex].id)
      } else {
        const catIndex = selectedIndex - results.length
        handleSelect(undefined, categoryResults[catIndex].id)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setQuery('')
      onClose?.()
    }
  }, [results, categoryResults, selectedIndex, hasResults, handleSelect, onClose])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
    }

    document.addEventListener('keydown', handleShortcut)
    return () => document.removeEventListener('keydown', handleShortcut)
  }, [])

  // Focus input on mobile when opened
  useEffect(() => {
    if (isMobile) {
      inputRef.current?.focus()
    }
  }, [isMobile])

  return (
    <div ref={containerRef} className={cn('relative', !isMobile && 'hidden md:block')}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
      <Input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={isMobile ? t.searchPlaceholder : t.searchPlaceholderShortcut}
        className={cn(
          'pl-9 pr-8 bg-neutral-800 border-neutral-700 h-9 text-sm',
          isMobile ? 'w-full' : 'w-72'
        )}
      />
      {query && (
        <button
          onClick={() => {
            setQuery('')
            inputRef.current?.focus()
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {isOpen && query.length >= 2 && (
        <div className={cn(
          'absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl overflow-hidden z-50',
          isMobile && 'fixed left-3 right-3 top-auto'
        )}>
          {!hasResults ? (
            <div className="p-4 text-center text-neutral-500 text-sm">
              {t.searchNoResults} &quot;{query}&quot;
            </div>
          ) : (
            <div className="max-h-80 sm:max-h-96 overflow-y-auto">
              {results.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-medium text-neutral-500 bg-neutral-800/50">
                    {t.resultsTransactions}
                  </div>
                  {results.map((transaction, index) => (
                    <button
                      key={transaction.id}
                      onClick={() => handleSelect(transaction.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 hover:bg-neutral-800 transition-colors',
                        selectedIndex === index && 'bg-neutral-800'
                      )}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div
                          className={cn(
                            'flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full flex-shrink-0',
                            transaction.type === 'receita'
                              ? 'bg-green-500/20'
                              : transaction.type === 'investimento'
                              ? 'bg-blue-500/20'
                              : 'bg-red-500/20'
                          )}
                        >
                          {transaction.type === 'receita' ? (
                            <ArrowDownLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
                          ) : transaction.type === 'investimento' ? (
                            <LineChart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                          ) : (
                            <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                          )}
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-neutral-500 flex items-center gap-1 truncate">
                            {transaction.category && <CategoryIcon icon={transaction.category.icon} size="sm" />}
                            <span className="truncate">{transaction.category?.name || t.uncategorized}</span>
                            <span className="hidden sm:inline"> • {formatLocalizedDate(transaction.date, localeTag)}</span>
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          'text-sm font-medium flex-shrink-0 ml-2',
                          transaction.type === 'receita'
                            ? 'text-green-500'
                            : transaction.type === 'investimento'
                            ? 'text-blue-500'
                            : 'text-red-500'
                        )}
                      >
                        {transaction.type === 'receita' ? '+' : '-'} {formatMoney(transaction.amount)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {categoryResults.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-medium text-neutral-500 bg-neutral-800/50">
                    {t.resultsCategories}
                  </div>
                  {categoryResults.map((category, index) => (
                    <button
                      key={category.id}
                      onClick={() => handleSelect(undefined, category.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-800 transition-colors',
                        selectedIndex === results.length + index && 'bg-neutral-800'
                      )}
                    >
                      <CategoryIcon icon={category.icon} size="lg" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-white">{category.name}</p>
                        <p className="text-xs text-neutral-500 capitalize">{tCommon.transactionTypes[category.type]}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="px-3 py-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
            <span className="hidden sm:inline">{t.hintNavigate}</span>
            <span className="sm:hidden">{t.hintTap}</span>
            <span className="hidden sm:inline">{t.hintSelectClose}</span>
          </div>
        </div>
      )}
    </div>
  )
}
