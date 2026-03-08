'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { User } from '@/types/user'
import { mockUser } from '@/lib/mock-data'

interface LoginRequest {
  email: string
  password: string
}

interface AuthResponse {
  token: string
  user: User
}

export function useAuth() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        return await api.get<User>('/auth/me')
      } catch {
        // Fallback to mock user if authenticated
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        return token ? mockUser : null
      }
    },
    enabled: isClient,
  })

  const login = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await api.post<AuthResponse>('/auth/login', credentials)
      localStorage.setItem('token', response.token)
      return response
    },
  })

  const logout = () => {
    localStorage.removeItem('token')
    window.location.href = '/'
  }

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  }
}
