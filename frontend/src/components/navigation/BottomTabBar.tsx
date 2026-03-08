'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Zap,
  Search,
  Bookmark,
  User,
} from 'lucide-react'
import { useResponsive } from '@/hooks/useMediaQuery'

const navItems = [
  { key: 'feed', icon: Zap, href: '/feed' },
  { key: 'search', icon: Search, href: '/search' },
  { key: 'saved', icon: Bookmark, href: '/saved' },
  { key: 'profile', icon: User, href: '/profile' },
]

export function BottomTabBar() {
  const { isDesktop } = useResponsive()
  const t = useTranslations('navigation')
  const pathname = usePathname()

  // Hide on desktop
  if (isDesktop) return null

  const getLocalizedPath = (href: string) => {
    const localeMatch = pathname.match(/^\/([a-z]{2})/)
    const locale = localeMatch ? localeMatch[1] : 'en'
    return `/${locale}${href}`
  }

  const isActive = (href: string) => {
    const localizedPath = getLocalizedPath(href)
    return pathname === localizedPath || pathname.endsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-14 border-t border-border bg-bg-primary z-40 flex items-center justify-around">
      {navItems.map(({ key, icon: Icon, href }) => {
        const active = isActive(href)
        return (
          <Link
            key={key}
            href={getLocalizedPath(href)}
            className={`flex items-center justify-center w-14 h-14 transition-colors duration-150 ${
              active ? 'text-accent' : 'text-text-secondary'
            }`}
            aria-label={t(key as keyof typeof navItems)}
          >
            <Icon className="w-6 h-6" />
          </Link>
        )
      })}
    </nav>
  )
}
