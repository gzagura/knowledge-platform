'use client'

import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { api, TOKEN_KEY } from '@/lib/api'
import { User } from '@/types/user'

interface BackendUser {
  id: string
  email: string
  name: string
  avatar_url?: string
  preferred_language: string
  ui_language: string
  preferred_reading_time: number
  theme: string
  created_at: string
}

function mapUser(data: BackendUser): User {
  const readingTime = data.preferred_reading_time <= 3
    ? 'quick'
    : data.preferred_reading_time >= 10
      ? 'deep'
      : 'standard'
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    avatar: data.avatar_url,
    createdAt: data.created_at,
    articlesRead: 0,
    currentStreak: 0,
    interests: [],
    readingTimePreference: readingTime,
  }
}

export function useAuth() {
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const locale = useLocale()
  const queryClient = useQueryClient()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const hasToken = isClient && !!localStorage.getItem(TOKEN_KEY)

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      // Corrected endpoint: GET /api/v1/users/me (not /auth/me)
      const data = await api.get<BackendUser>('/users/me')
      return mapUser(data)
    },
    enabled: isClient && hasToken,
    retry: false,
  })

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    // Clear the edge-auth cookie so middleware stops allowing protected routes.
    document.cookie = 'kp_auth=; path=/; max-age=0; SameSite=Lax'
    queryClient.removeQueries({ queryKey: ['auth', 'me'] })
    router.push(`/${locale}/login`)
  }

  return {
    user: user || null,
    isLoading: isClient ? isLoading : true,
    isAuthenticated: !!user,
    logout,
  }
}
