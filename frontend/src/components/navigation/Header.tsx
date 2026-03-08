'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Settings } from 'lucide-react'
import { useResponsive } from '@/hooks/useMediaQuery'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function Header() {
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

  return (
    <header className="sticky top-0 h-14 border-b border-border bg-bg-primary z-30 flex items-center justify-between px-4">
      <Link
        href={getLocalizedPath('/feed')}
        className="font-bold text-text-primary text-base"
      >
        {t('logo')}
      </Link>

      <div className="flex items-center gap-2">
        <Link
          href={getLocalizedPath('/search')}
          className="p-2 hover:bg-bg-secondary rounded-lg transition-colors duration-150"
          aria-label="Search"
        >
          <Search className="w-5 h-5 text-text-primary" />
        </Link>
        <Link
          href={getLocalizedPath('/settings')}
          className="p-2 hover:bg-bg-secondary rounded-lg transition-colors duration-150"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-text-primary" />
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
