'use client'

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Zap,
  Search,
  Bookmark,
  User,
  Settings,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

const navItems = [
  { key: 'feed', icon: Zap, href: '/feed' },
  { key: 'search', icon: Search, href: '/search' },
  { key: 'saved', icon: Bookmark, href: '/saved' },
  { key: 'profile', icon: User, href: '/profile' },
  { key: 'settings', icon: Settings, href: '/settings' },
]

export function DesktopSidebar() {
  const t = useTranslations('navigation')
  const pathname = usePathname()
  const locale = useLocale()

  const getLocalizedPath = (href: string) => `/${locale}${href}`

  const isActive = (href: string) => {
    return pathname === getLocalizedPath(href)
  }

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-dvh w-48 flex-col gap-8 border-r border-border bg-bg-primary p-6 z-40">
      {/* Logo */}
      <Link
        href={getLocalizedPath('/feed')}
        className="text-lg font-bold text-text-primary hover:opacity-75 transition-opacity duration-150"
      >
        {t('logo')}
      </Link>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map(({ key, icon: Icon, href }) => {
          const active = isActive(href)
          return (
            <Link
              key={key}
              href={getLocalizedPath(href)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150 ${
                active
                  ? 'text-text-primary font-medium bg-bg-secondary'
                  : 'text-text-secondary hover:bg-bg-secondary'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{t(key as keyof typeof navItems)}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Controls */}
      <div className="flex flex-col gap-3 border-t border-border pt-6">
        <div className="flex gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </aside>
  )
}
