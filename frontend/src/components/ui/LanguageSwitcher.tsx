'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { locales, localeNames } from '@/i18n/config'

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleLanguageChange = (newLocale: string) => {
    // With localePrefix: 'always', pathname always starts with /[locale]/...
    // Replace the locale segment at the start: /en/feed → /uk/feed
    const withoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/')
    const newPath = `/${newLocale}${withoutLocale === '/' ? '' : withoutLocale}`
    router.push(newPath)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 hover:bg-bg-secondary rounded-lg transition-colors duration-150"
      >
        <span className="font-medium text-sm text-text-primary">
          {locale.toUpperCase()}
        </span>
        <ChevronDown className="w-4 h-4 text-text-secondary" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-bg-primary border border-border rounded-lg shadow-lg z-50 min-w-[120px]">
          {locales.map((lng) => (
            <button
              key={lng}
              onClick={() => handleLanguageChange(lng)}
              className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                locale === lng
                  ? 'bg-bg-secondary text-text-primary font-medium'
                  : 'text-text-primary hover:bg-bg-secondary'
              }`}
            >
              {localeNames[lng as keyof typeof localeNames]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
