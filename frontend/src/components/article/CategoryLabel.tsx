'use client'

interface CategoryLabelProps {
  category: string | null
  readingTimeMinutes: number
}

export function CategoryLabel({ category, readingTimeMinutes }: CategoryLabelProps) {
  return (
    <span className="text-xs text-text-tertiary font-medium">
      {category} · {readingTimeMinutes} min
    </span>
  )
}
