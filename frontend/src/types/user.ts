export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
  articlesRead: number
  currentStreak: number
  interests: string[]
  readingTimePreference: 'quick' | 'standard' | 'deep'
}

export interface UserUpdate {
  name?: string
  interests?: string[]
  readingTimePreference?: 'quick' | 'standard' | 'deep'
}

export interface Interest {
  id: string
  name: string
  slug: string
}
