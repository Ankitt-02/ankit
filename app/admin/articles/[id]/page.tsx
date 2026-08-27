import { notFound } from 'next/navigation'
import { getArticleByIdAdmin } from '@/lib/db/articles'
import { ArticleForm } from '@/components/admin/article-form'

export const dynamic = 'force-dynamic'

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const article = await getArticleByIdAdmin(id)

  if (!article) {
    notFound()
  }

  return <ArticleForm article={article} />
}
