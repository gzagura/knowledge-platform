'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useResponsive } from '@/hooks/useMediaQuery'
import { useAuth } from '@/hooks/useAuth'

export function RightSidebar() {
  const { isWideDesktop } = useResponsive()
  const t = useTranslations()
  const pathname = usePathname()
  const { user } = useAuth()

  // Only show on wide desktop
  if (!isWideDesktop) return null

  const getLocalizedPath = (href: string) => {
    const localeMatch = pathname.match(/^\/([a-z]{2})/)
    const locale = localeMatch ? localeMatch[1] : 'en'
    return `/${locale}${href}`
  }

  // Mock saved articles for demo
  const savedArticles = [
    { id: '1', title: 'The History of Artificial Intelligence' },
    { id: '2', title: 'Ancient Rome: Rise and Fall of an Empire' },
    { id: '3', title: 'The Human Brain: Unlocking Its Mysteries' },
  ]

  return (
    <aside className="hidden xl:flex fixed right-0 top-0 h-dvh w-64 flex-col gap-6 border-l border-border bg-bg-primary p-6 overflow-y-auto">
      {/* Saved Section */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Saved</h3>
        <div className="flex flex-col gap-2">
          {savedArticles.slice(0, 3).map((article) => (
            <Link
              key={article.id}
              href={getLocalizedPath(`/article/${article.id}`)}
              className="text-xs text-text-secondary hover:text-text-primary transition-colors duration-150 line-clamp-2"
            >
              {article.title}
            </Link>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Stats Section */}
      {user && (
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            {t('profile.stats')}
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-text-secondary">
                {t('profile.articlesRead')}
              </span>
              <span className="text-text-primary font-medium">
                {user.articlesRead}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">
                {t('profile.currentStreak')}
              </span>
              <span className="text-text-primary font-medium">
                {user.currentStreak} {t('profile.days')}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
