'use client'

import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { mockArticles } from '@/lib/mock-data'
import { CategoryLabel } from '@/components/article/CategoryLabel'

export default function SavedPage() {
  const t = useTranslations('saved')
  const router = useRouter()
  const locale = useLocale()

  // Mock bookmarked articles - in real app this would come from API
  const savedArticles = mockArticles.filter((_, idx) => idx < 2)

  return (
    <div className="max-w-4xl mx-auto w-full h-full flex flex-col px-4 py-6 md:px-6 md:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">{t('title')}</h1>
        {savedArticles.length > 0 && (
          <p className="text-sm text-text-secondary">
            {savedArticles.length} {t('count')}
          </p>
        )}
      </div>

      {/* Articles List */}
      {savedArticles.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-secondary text-center">{t('empty')}</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4">
          {savedArticles.map((article) => (
            <button
              key={article.id}
              onClick={() => router.push(`/${locale}/article/${article.id}`)}
              className="text-left p-6 border border-border rounded-lg hover:bg-bg-secondary transition-colors duration-150"
            >
              <CategoryLabel
                category={article.category}
                readingTime={article.readingTime}
              />
              <h3 className="text-xl font-semibold text-text-primary mt-3 line-clamp-2">
                {article.title}
              </h3>
              <p className="text-base text-text-secondary mt-2 line-clamp-3">
                {article.extract}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
