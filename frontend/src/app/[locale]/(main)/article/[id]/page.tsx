'use client'

import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useArticle } from '@/hooks/useArticles'
import { ArticleFullView } from '@/components/article/ArticleFullView'
import { ArticleSkeleton } from '@/components/ui/Skeleton'

interface ArticlePageProps {
  params: {
    id: string
  }
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const { id } = params
  const router = useRouter()
  const locale = useLocale()
  const { data: article, isLoading, isError } = useArticle(id)

  if (isLoading) {
    return <ArticleSkeleton />
  }

  if (isError || !article) {
    return (
      <div className="w-full h-dvh flex items-center justify-center">
        <p className="text-text-secondary">Article not found</p>
      </div>
    )
  }

  return (
    <ArticleFullView
      articleId={article.id}
      title={article.title}
      content={article.content}
      category={article.category}
      readingTime={article.readingTime}
      liked={article.liked}
      bookmarked={article.bookmarked}
      likeCount={article.likeCount}
      url={article.url}
      onClose={() => router.back()}
    />
  )
}
