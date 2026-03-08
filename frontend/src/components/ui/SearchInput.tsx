'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'

interface SearchInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  debounceDelay?: number
}

export function SearchInput({
  value = '',
  onChange,
  placeholder = 'Search...',
  debounceDelay = 300,
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange?.(inputValue)
    }, debounceDelay)

    return () => clearTimeout(timer)
  }, [inputValue, onChange, debounceDelay])

  return (
    <div className="relative w-full">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent transition-colors duration-150"
      />
      {inputValue && (
        <button
          onClick={() => setInputValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors duration-150"
          aria-label="Clear search"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
