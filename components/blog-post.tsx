import Link from 'next/link'
import type { BlogPost } from '@/lib/markdown'

export function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <div className="group p-6 rounded-lg border border-border/40 hover:border-accent/40 bg-card/50 hover:bg-card transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold flex-1 group-hover:text-accent transition-colors">
            {post.frontmatter.title}
          </h3>
          <span className="text-xs text-muted-foreground font-mono ml-4 whitespace-nowrap">
            {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
        <p className="text-muted-foreground text-sm mb-4">{post.frontmatter.description}</p>
        {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.frontmatter.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full border border-border bg-muted/30 text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

export function BlogPostContent({ post }: { post: BlogPost }) {
  // Extract reading time (roughly 200 words per minute)
  const wordCount = post.content.split(/\s+/).length
  const readingTime = Math.ceil(wordCount / 200)

  return (
    <article className="prose prose-invert max-w-none">
      <header className="mb-12 not-prose">
        <h1 className="text-5xl font-bold tracking-tight mb-4">{post.frontmatter.title}</h1>
        <p className="text-lg text-muted-foreground mb-6">{post.frontmatter.description}</p>
        <div className="flex items-center gap-6 text-sm text-muted-foreground border-t border-b border-border/40 py-4 flex-wrap">
          <span>
            {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          {post.frontmatter.author && <span>{post.frontmatter.author}</span>}
          <span>{readingTime} min read</span>
          {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
            <div className="flex gap-2">
              {post.frontmatter.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-1 rounded-full border border-border bg-muted/30">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <div
        className="prose-content"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

      <footer className="mt-12 pt-8 border-t border-border/40 not-prose">
        <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to all articles
        </Link>
      </footer>
    </article>
  )
}
