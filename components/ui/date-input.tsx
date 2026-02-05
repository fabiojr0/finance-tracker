'use client'

import { useState, useEffect, useRef } from 'react'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface DateInputProps {
  value: string // ISO format: yyyy-mm-dd
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function DateInput({ value, onChange, placeholder = 'dd/mm/aaaa', className }: DateInputProps) {
  const [displayValue, setDisplayValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const hiddenInputRef = useRef<HTMLInputElement>(null)

  // Convert ISO to display format (dd/mm/yyyy)
  useEffect(() => {
    if (value) {
      const [year, month, day] = value.split('-')
      setDisplayValue(`${day}/${month}/${year}`)
    } else {
      setDisplayValue('')
    }
  }, [value])

  // Handle manual input with mask
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, '') // Remove non-digits

    // Apply mask dd/mm/yyyy
    if (input.length > 8) input = input.slice(0, 8)

    let formatted = ''
    if (input.length > 0) {
      formatted = input.slice(0, 2)
      if (input.length > 2) {
        formatted += '/' + input.slice(2, 4)
        if (input.length > 4) {
          formatted += '/' + input.slice(4, 8)
        }
      }
    }

    setDisplayValue(formatted)

    // If complete date, convert to ISO and call onChange
    if (input.length === 8) {
      const day = input.slice(0, 2)
      const month = input.slice(2, 4)
      const year = input.slice(4, 8)

      // Validate date
      const dateObj = new Date(`${year}-${month}-${day}`)
      if (!isNaN(dateObj.getTime()) &&
          dateObj.getDate() === parseInt(day) &&
          dateObj.getMonth() + 1 === parseInt(month)) {
        onChange(`${year}-${month}-${day}`)
      }
    } else if (input.length === 0) {
      onChange('')
    }
  }

  // Open native date picker when clicking calendar icon
  const handleCalendarClick = () => {
    hiddenInputRef.current?.showPicker()
  }

  // Handle date selection from native picker
  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          'w-full h-10 rounded-md border border-neutral-700 bg-neutral-800 px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary',
          className
        )}
      />
      <button
        type="button"
        onClick={handleCalendarClick}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors"
      >
        <Calendar className="h-4 w-4" />
      </button>
      <input
        ref={hiddenInputRef}
        type="date"
        value={value}
        onChange={handleNativeDateChange}
        className="absolute opacity-0 pointer-events-none"
        tabIndex={-1}
      />
    </div>
  )
}
