'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
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

  useEffect(() => {
    setIsClient(true)
  }, [])

  const hasToken = isClient && !!localStorage.getItem('token')

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const data = await api.get<BackendUser>('/auth/me')
      return mapUser(data)
    },
    enabled: isClient && hasToken,
    retry: false,
  })

  const logout = () => {
    localStorage.removeItem('token')
    window.location.href = '/'
  }

  return {
    user: user || null,
    isLoading: isClient ? isLoading : true,
    isAuthenticated: !!user,
    logout,
  }
}
