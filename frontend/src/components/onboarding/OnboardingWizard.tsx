'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  BookOpen,
  Globe,
  Palette,
  Map,
  Stethoscope,
  Brain,
  Trophy,
  Music,
  Film,
} from 'lucide-react'

type Step = 'language' | 'interests' | 'readingTime' | 'auth'

const categories = [
  { key: 'science', icon: Zap, label: 'Science' },
  { key: 'history', icon: BookOpen, label: 'History' },
  { key: 'technology', icon: Globe, label: 'Technology' },
  { key: 'art', icon: Palette, label: 'Art' },
  { key: 'geography', icon: Map, label: 'Geography' },
  { key: 'medicine', icon: Stethoscope, label: 'Medicine' },
  { key: 'philosophy', icon: Brain, label: 'Philosophy' },
  { key: 'sports', icon: Trophy, label: 'Sports' },
  { key: 'music', icon: Music, label: 'Music' },
  { key: 'cinema', icon: Film, label: 'Cinema' },
]

interface OnboardingWizardProps {
  onComplete?: (preferences: {
    language: string
    interests: string[]
    readingTime: 'quick' | 'standard' | 'deep'
  }) => void
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('language')
  const [language, setLanguage] = useState('')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [readingTime, setReadingTime] = useState<'quick' | 'standard' | 'deep'>('standard')
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('onboarding')

  const steps: Step[] = ['language', 'interests', 'readingTime', 'auth']
  const currentStepIndex = steps.indexOf(currentStep)

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1]!)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]!)
    }
  }

  const handleComplete = () => {
    const preferences = {
      language: language || locale,
      interests: selectedInterests,
      readingTime,
    }

    localStorage.setItem('onboarded', 'true')
    localStorage.setItem('userPreferences', JSON.stringify(preferences))

    onComplete?.(preferences)
    router.push(`/${language || locale}/feed`)
  }

  const handleSkip = () => {
    localStorage.setItem('onboarded', 'true')
    router.push(`/${language || locale}/feed`)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 'language':
        return !!language
      case 'interests':
        return selectedInterests.length >= 3 && selectedInterests.length <= 5
      case 'readingTime':
        return !!readingTime
      case 'auth':
        return true
      default:
        return false
    }
  }

  return (
    <div className="min-h-dvh bg-bg-primary flex flex-col items-center justify-center px-4 py-8">
      {/* Header */}
      <div className="mb-12 text-center max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
          {t('title')}
        </h1>
      </div>

      {/* Steps Container */}
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {currentStep === 'language' && (
            <motion.div
              key="language"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  {t('step1.title')}
                </h2>
                <p className="text-text-secondary">{t('step1.description')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {([['en', 'English'], ['uk', 'Українська'], ['ru', 'Русский']] as const).map(([code, label]) => (
                  <button
                    key={code}
                    onClick={() => setLanguage(code)}
                    className={`p-6 rounded-lg border-2 transition-all duration-200 font-medium ${
                      language === code
                        ? 'border-accent bg-bg-secondary text-text-primary'
                        : 'border-border hover:border-text-tertiary text-text-primary'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === 'interests' && (
            <motion.div
              key="interests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  {t('step2.title')}
                </h2>
                <p className="text-text-secondary">{t('step2.description')}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map(({ key, icon: Icon, label }) => {
                  const isSelected = selectedInterests.includes(key)
                  return (
                    <motion.button
                      key={key}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedInterests(
                            selectedInterests.filter((i) => i !== key)
                          )
                        } else if (selectedInterests.length < 5) {
                          setSelectedInterests([...selectedInterests, key])
                        }
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-accent bg-bg-secondary'
                          : 'border-border hover:border-text-tertiary'
                      }`}
                    >
                      <Icon className="w-6 h-6 text-text-primary" />
                      <span className="text-xs font-medium text-text-primary text-center">
                        {label}
                      </span>
                    </motion.button>
                  )
                })}
              </div>

              <p className="text-xs text-text-tertiary text-center">
                {selectedInterests.length}/5 selected
              </p>
            </motion.div>
          )}

          {currentStep === 'readingTime' && (
            <motion.div
              key="readingTime"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  {t('step3.title')}
                </h2>
                <p className="text-text-secondary">{t('step3.description')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: 'quick' as const, title: t('step3.quick'), desc: t('step3.quickDesc') },
                  { value: 'standard' as const, title: t('step3.standard'), desc: t('step3.standardDesc') },
                  { value: 'deep' as const, title: t('step3.deep'), desc: t('step3.deepDesc') },
                ].map(({ value, title, desc }) => (
                  <motion.button
                    key={value}
                    onClick={() => setReadingTime(value)}
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 rounded-lg border-2 transition-all duration-200 text-center ${
                      readingTime === value
                        ? 'border-accent bg-bg-secondary'
                        : 'border-border hover:border-text-tertiary'
                    }`}
                  >
                    <p className="font-bold text-text-primary mb-1">{title}</p>
                    <p className="text-sm text-text-secondary">{desc}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === 'auth' && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  {t('step4.title')}
                </h2>
                <p className="text-text-secondary">{t('step4.description')}</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => alert('Google OAuth - Coming Soon')}
                  className="w-full px-4 py-3 border border-border rounded-lg font-medium text-text-primary hover:bg-bg-secondary transition-colors duration-150"
                >
                  {t('step4.signupGoogle')}
                </button>
                <button
                  onClick={() => alert('GitHub OAuth - Coming Soon')}
                  className="w-full px-4 py-3 border border-border rounded-lg font-medium text-text-primary hover:bg-bg-secondary transition-colors duration-150"
                >
                  {t('step4.signupGithub')}
                </button>
              </div>

              <button
                onClick={handleSkip}
                className="w-full text-sm text-text-secondary hover:text-text-primary transition-colors duration-150"
              >
                {t('step4.continueWithout')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Dots */}
      <div className="flex gap-2 justify-center mt-12 mb-8">
        {steps.map((step, idx) => (
          <div
            key={step}
            className={`h-2 rounded-full transition-all duration-200 ${
              idx === currentStepIndex
                ? 'w-8 bg-accent'
                : idx < currentStepIndex
                  ? 'w-2 bg-accent'
                  : 'w-2 bg-border'
            }`}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="w-full max-w-2xl flex gap-4 justify-between">
        {currentStepIndex > 0 && (
          <button
            onClick={handleBack}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-150"
          >
            {t('back')}
          </button>
        )}

        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="ml-auto px-6 py-2 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentStepIndex === steps.length - 1 ? 'Start' : t('next')}
        </button>
      </div>
    </div>
  )
}
