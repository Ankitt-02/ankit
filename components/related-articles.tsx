import Link from 'next/link'
import { getAllBlogPosts } from '@/lib/markdown'

export async function RelatedArticles({ currentSlug, tags }: { currentSlug: string; tags?: string[] }) {
  if (!tags || tags.length === 0) return null

  const allPosts = await getAllBlogPosts()

  // Find related articles by tags
  const relatedPosts = allPosts
    .filter((post) => post.slug !== currentSlug && post.frontmatter.tags)
    .filter((post) =>
      post.frontmatter.tags?.some((tag) => tags.includes(tag))
    )
    .slice(0, 3)

  if (relatedPosts.length === 0) return null

  return (
    <section className="mt-16 pt-8 border-t border-border/40">
      <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {relatedPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <div className="group p-4 rounded-lg border border-border/40 hover:border-accent/40 bg-card/50 hover:bg-card transition-all cursor-pointer h-full">
              <h4 className="font-semibold mb-2 group-hover:text-accent transition-colors line-clamp-2">
                {post.frontmatter.title}
              </h4>
              <p className="text-xs text-muted-foreground">
                {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
