'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export default function HomePage() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const locale = useLocale()

  useEffect(() => {
    const onboarded = localStorage.getItem('onboarded')

    if (!onboarded) {
      setShowOnboarding(true)
    } else {
      router.push(`/${locale}/feed`)
    }

    setIsLoading(false)
  }, [locale, router])

  if (isLoading) {
    return <div className="min-h-dvh bg-bg-primary" />
  }

  if (showOnboarding) {
    return <OnboardingWizard />
  }

  return null
}
