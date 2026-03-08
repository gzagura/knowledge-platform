'use client'

import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function ProfilePage() {
  const t = useTranslations()
  const router = useRouter()
  const locale = useLocale()
  const { user, logout } = useAuth()

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto w-full h-full flex flex-col items-center justify-center px-4 py-6">
        <p className="text-text-secondary mb-6">Please log in to view your profile</p>
        <button
          onClick={() => router.push(`/${locale}/login`)}
          className="px-6 py-2 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity duration-150"
        >
          Log In
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col px-4 py-6 md:px-6 md:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          {t('profile.title')}
        </h1>
      </div>

      {/* Profile Card */}
      <div className="bg-bg-secondary border border-border rounded-lg p-6 md:p-8 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm text-text-tertiary mb-1">
              {t('profile.joinDate')}
            </p>
            <p className="text-text-primary font-medium">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-bg-primary transition-colors duration-150 text-text-primary"
          >
            <LogOut className="w-4 h-4" />
            {t('profile.logout')}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          {t('profile.stats')}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bg-secondary border border-border rounded-lg p-6">
            <p className="text-sm text-text-tertiary mb-2">
              {t('profile.articlesRead')}
            </p>
            <p className="text-3xl font-bold text-text-primary">
              {user.articlesRead}
            </p>
          </div>
          <div className="bg-bg-secondary border border-border rounded-lg p-6">
            <p className="text-sm text-text-tertiary mb-2">
              {t('profile.currentStreak')}
            </p>
            <p className="text-3xl font-bold text-text-primary">
              {user.currentStreak}
            </p>
          </div>
        </div>
      </div>

      {/* Interests */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          {t('profile.topCategories')}
        </h2>
        <div className="flex flex-wrap gap-2">
          {user.interests.map((interest) => (
            <span
              key={interest}
              className="px-3 py-1 bg-bg-secondary border border-border rounded-full text-sm text-text-primary"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Account Settings Link */}
      <button
        onClick={() => router.push(`/${locale}/settings`)}
        className="px-6 py-2 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity duration-150 self-start"
      >
        {t('settings.title')}
      </button>
    </div>
  )
}
