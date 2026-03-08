'use client'

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-bg-secondary rounded animate-pulse ${className}`} />
  )
}

export function ArticleSkeleton() {
  return (
    <div className="w-full h-dvh flex flex-col justify-center items-center px-4 py-8 gap-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}
