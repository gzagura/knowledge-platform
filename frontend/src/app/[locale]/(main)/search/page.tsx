'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { useSearchArticles } from '@/hooks/useArticles'
import { SearchInput } from '@/components/ui/SearchInput'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const t = useTranslations('search')
  const locale = useLocale()

  // lang is derived from the current Next-intl locale; default to 'en' for any unsupported locale
  const lang = ['en', 'uk', 'ru'].includes(locale) ? locale : 'en'
  const { data: response, isLoading, isError } = useSearchArticles(query, lang)

  const items = response?.items ?? []
  const total = response?.total ?? 0
  const hasQuery = query.trim().length >= 2

  return (
    <div className="max-w-4xl mx-auto w-full h-full flex flex-col px-4 py-6 md:px-6 md:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-4">{t('title')}</h1>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={t('placeholder')}
        />
      </div>

      {/* Results area */}
      <div className="flex-1 flex flex-col gap-4">
        {hasQuery && isLoading && (
          <p className="text-text-secondary text-center py-8">{t('searching')}</p>
        )}

        {hasQuery && isError && (
          <p className="text-text-secondary text-center py-8">{t('error')}</p>
        )}

        {hasQuery && !isLoading && !isError && items.length === 0 && (
          <p className="text-text-secondary text-center py-8">{t('noResults')}</p>
        )}

        {hasQuery && !isLoading && items.length > 0 && (
          <>
            {/* Result count */}
            <p className="text-sm text-text-tertiary" aria-live="polite">
              {t('resultsCount', { count: total, query })}
            </p>

            <div className="grid gap-4">
              {items.map((article) => (
                // Search items carry a wikipedia_id (integer), not an internal UUID.
                // Linking to Wikipedia directly is the correct interim behaviour per STORY-002.
                <a
                  key={article.id}
                  href={`https://${lang}.wikipedia.org/?curid=${article.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-left p-4 border border-border rounded-lg hover:bg-bg-secondary transition-colors duration-150 block"
                >
                  <h3 className="text-lg font-semibold text-text-primary line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                    {article.extract}
                  </p>
                </a>
              ))}
            </div>
          </>
        )}

        {!hasQuery && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-text-tertiary text-center">{t('placeholder')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
