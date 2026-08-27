import { getAllArticlesAdmin } from '@/lib/db/articles'
import { ArticlesList } from '@/components/admin/articles-list'

export const dynamic = 'force-dynamic'

export default async function AdminArticlesPage() {
  const articles = await getAllArticlesAdmin()

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Articles CMS</h1>
        <p className="text-foreground/70">
          Create, edit, manage, and publish your blog articles.
        </p>
      </div>

      <ArticlesList initialArticles={articles} />
    </div>
  )
}
