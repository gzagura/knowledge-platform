'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { useAuth } from '@/hooks/useAuth'

const categories = [
  'Science', 'History', 'Technology', 'Art', 'Geography',
  'Medicine', 'Philosophy', 'Sports', 'Music', 'Cinema',
]

const themeOptions = [
  { value: 'light', labelKey: 'settings.light' },
  { value: 'dark',  labelKey: 'settings.dark' },
  { value: 'system', labelKey: 'settings.system' },
] as const

export default function SettingsPage() {
  const t = useTranslations()
  const router = useRouter()
  const locale = useLocale()
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  const [readingTime, setReadingTime] = useState<'quick' | 'standard' | 'deep'>('standard')
  const [interests, setInterests] = useState<string[]>([])
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setReadingTime(user.readingTimePreference)
      setInterests(user.interests)
    }
  }, [user])

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }

  const handleSave = () => {
    localStorage.setItem('userPreferences', JSON.stringify({ language: locale, interests, readingTime }))
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col px-4 py-6 md:px-6 md:py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">{t('settings.title')}</h1>
      </div>

      <div className="space-y-8">
        {/* Theme */}
        <div className="border-b border-border pb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">{t('settings.theme')}</h2>
          <div className="flex gap-4">
            {themeOptions.map(({ value, labelKey }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`px-4 py-2 border rounded-lg transition-colors duration-150 capitalize ${
                  theme === value ? 'bg-accent text-white border-accent' : 'border-border hover:bg-bg-secondary'
                }`}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="border-b border-border pb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">{t('settings.language')}</h2>
          <LanguageSwitcher />
        </div>

        {/* Reading Time */}
        <div className="border-b border-border pb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">{t('settings.readingTime')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {([
              { value: 'quick', label: 'Quick (2 min)' },
              { value: 'standard', label: 'Standard (5 min)' },
              { value: 'deep', label: 'Deep Dive (10+ min)' },
            ] as const).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setReadingTime(value)}
                className={`px-4 py-3 border rounded-lg transition-colors duration-150 ${
                  readingTime === value ? 'bg-accent text-white border-accent' : 'border-border hover:bg-bg-secondary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="border-b border-border pb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">{t('settings.interests')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => toggleInterest(category)}
                className={`px-4 py-2 border rounded-lg transition-colors duration-150 text-sm ${
                  interests.includes(category)
                    ? 'bg-accent text-white border-accent'
                    : 'border-border hover:bg-bg-secondary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Account */}
        {user && (
          <div className="pb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">{t('settings.account')}</h2>
            <button
              onClick={logout}
              className="px-6 py-2 border border-accent text-accent rounded-lg font-medium hover:bg-accent hover:text-white transition-colors duration-150"
            >
              {t('settings.logout')}
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-8 pt-8 border-t border-border">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity duration-150"
        >
          {t('settings.save')}
        </button>
        {isSaved && <span className="flex items-center text-sm text-accent">✓ Changes saved</span>}
      </div>
    </div>
  )
}
