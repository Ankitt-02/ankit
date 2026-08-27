import { getPublishedArticles } from '@/lib/db/articles'
import { BlogSearch } from '@/components/blog-search'
import { ContentLayout } from '@/components/content-layout'
import type { BlogPost } from '@/lib/markdown'

export const dynamic = 'force-dynamic'

export default async function ArticlesPage() {
  // Fetch published articles exclusively from Supabase database
  const supabaseArticles = await getPublishedArticles(50)

  // Map Supabase articles to BlogPost format for BlogSearch component
  const dbPosts: BlogPost[] = supabaseArticles.map((art) => ({
    slug: art.slug,
    frontmatter: {
      title: art.title,
      description: art.excerpt || art.seo_description || '',
      date: art.published_at || art.created_at,
      author: art.author?.name || 'Ankit',
      published: art.published,
      tags: art.tags?.map((t) => t.name) || [],
    },
    content: art.content || '',
    html: '',
  }))

  return (
    <ContentLayout
      title="Articles"
      description="Technical essays, software architecture notes, and engineering observations."
    >
      {dbPosts.length > 0 ? (
        <BlogSearch posts={dbPosts} />
      ) : (
        <div className="py-20 text-center rounded-2xl border border-dashed border-border/60 bg-card/20 space-y-2">
          <p className="text-foreground/80 font-medium">No published articles yet.</p>
          <p className="text-xs text-muted-foreground">New technical writing will appear here once published from the Admin CMS.</p>
        </div>
      )}
    </ContentLayout>
  )
}
