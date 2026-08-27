import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getArticleBySlug } from '@/lib/db/articles'
import { renderMarkdownToHtml, getBlogPost } from '@/lib/markdown'
import { ReadingProgress } from '@/components/reading-progress'
import { Clock, Calendar, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // 1. Fetch from Supabase database
  const article = await getArticleBySlug(slug)

  if (article && article.published && article.status === 'published') {
    const htmlContent = await renderMarkdownToHtml(article.content || '')

    return (
      <>
        <ReadingProgress />
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
          <div className="mx-auto max-w-4xl px-6 py-12 md:py-20">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors mb-8 group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to articles</span>
            </Link>

            <article className="space-y-8">
              {/* Header */}
              <header className="space-y-4 pb-8 border-b border-border/40">
                {article.featured && (
                  <span className="inline-block text-xs font-mono px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-500 font-medium">
                    ★ Featured Article
                  </span>
                )}
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                  {article.title}
                </h1>

                {article.excerpt && (
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
                    {article.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-6 text-xs text-muted-foreground pt-4 flex-wrap font-mono">
                  {article.published_at && (
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-accent" />
                      {new Date(article.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                  <span>By <strong className="text-foreground">{article.author?.name || 'Ankit'}</strong></span>
                  <span className="flex items-center gap-1.5 text-accent">
                    <Clock size={14} />
                    {article.reading_time || 1} min read
                  </span>
                </div>
              </header>

              {/* Main Content */}
              {htmlContent ? (
                <div
                  className="prose-content"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              ) : (
                <p className="text-muted-foreground italic text-sm">No article content provided.</p>
              )}
            </article>
          </div>
        </div>
      </>
    )
  }

  // 2. Fallback to local markdown post if present
  try {
    const post = await getBlogPost(slug)
    if (post && post.frontmatter.published !== false) {
      return (
        <>
          <ReadingProgress />
          <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <div className="mx-auto max-w-4xl px-6 py-12 md:py-20">
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors mb-8 group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                <span>Back to articles</span>
              </Link>
              <article className="space-y-8">
                <header className="space-y-4 pb-8 border-b border-border/40">
                  <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{post.frontmatter.title}</h1>
                  {post.frontmatter.description && (
                    <p className="text-lg md:text-xl text-muted-foreground">{post.frontmatter.description}</p>
                  )}
                </header>
                <div
                  className="prose-content"
                  dangerouslySetInnerHTML={{ __html: post.html }}
                />
              </article>
            </div>
          </div>
        </>
      )
    }
  } catch {
    // Markdown file doesn't exist
  }

  notFound()
}
