'use client'

interface CategoryLabelProps {
  category: string
  readingTime: number
}

export function CategoryLabel({ category, readingTime }: CategoryLabelProps) {
  return (
    <span className="text-xs text-text-tertiary font-medium">
      {category} · {readingTime} min
    </span>
  )
}
