'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useSearchArticles } from '@/hooks/useArticles'
import { SearchInput } from '@/components/ui/SearchInput'
import { CategoryLabel } from '@/components/article/CategoryLabel'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const t = useTranslations('search')
  const router = useRouter()
  const locale = useLocale()
  const { data: results, isLoading } = useSearchArticles(query)

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

      {/* Results */}
      <div className="flex-1 flex flex-col gap-4">
        {query && isLoading && (
          <p className="text-text-secondary text-center py-8">{t('searching')}</p>
        )}

        {query && !isLoading && results && results.length === 0 && (
          <p className="text-text-secondary text-center py-8">{t('noResults')}</p>
        )}

        {results && results.length > 0 && (
          <div className="grid gap-4">
            {results.map((article) => (
              <button
                key={article.id}
                onClick={() => router.push(`/${locale}/article/${article.id}`)}
                className="text-left p-4 border border-border rounded-lg hover:bg-bg-secondary transition-colors duration-150"
              >
                <CategoryLabel
                  category={article.category}
                  readingTimeMinutes={article.readingTimeMinutes}
                />
                <h3 className="text-lg font-semibold text-text-primary mt-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                  {article.extract}
                </p>
              </button>
            ))}
          </div>
        )}

        {!query && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-text-tertiary text-center">
              {t('placeholder')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
