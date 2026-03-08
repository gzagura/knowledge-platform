'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('auth')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      // In a real app, this would call the registration API
      // For now, just store a mock token
      localStorage.setItem('token', 'mock-token-' + Date.now())
      localStorage.setItem('onboarded', 'true')
      router.push(`/${locale}/feed`)
    } catch (err) {
      setError('Signup failed')
    }
  }

  const handleOAuth = (provider: string) => {
    alert(`${provider} authentication coming soon`)
  }

  return (
    <div className="min-h-dvh bg-bg-primary flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            {t('signup')}
          </h1>
          <p className="text-text-secondary">Create your account</p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-8">
          <button
            onClick={() => handleOAuth('Google')}
            className="w-full px-4 py-3 border border-border rounded-lg font-medium text-text-primary hover:bg-bg-secondary transition-colors duration-150"
          >
            {t('signupGoogle')}
          </button>
          <button
            onClick={() => handleOAuth('GitHub')}
            className="w-full px-4 py-3 border border-border rounded-lg font-medium text-text-primary hover:bg-bg-secondary transition-colors duration-150"
          >
            {t('signupGithub')}
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-bg-primary text-text-tertiary">Or</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
              {t('email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent transition-colors duration-150"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
              {t('password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent transition-colors duration-150"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent transition-colors duration-150"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity duration-150"
          >
            {t('signup')}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-text-secondary mt-6">
          {t('alreadyHaveAccount')}{' '}
          <button
            onClick={() => router.push(`/${locale}/login`)}
            className="text-accent hover:underline"
          >
            {t('login')}
          </button>
        </p>
      </div>
    </div>
  )
}
