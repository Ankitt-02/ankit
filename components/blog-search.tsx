'use client'

import { useEffect, useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import Link from 'next/link'
import { Search, ArrowUpRight, BookOpen } from 'lucide-react'
import type { BlogPost } from '@/lib/markdown'

export function BlogSearch({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<BlogPost[]>(posts)
  const [fuse, setFuse] = useState<Fuse<BlogPost> | null>(null)

  useEffect(() => {
    const fuseInstance = new Fuse(posts, {
      keys: ['frontmatter.title', 'frontmatter.description', 'frontmatter.tags', 'content'],
      threshold: 0.3,
      minMatchCharLength: 2,
    })
    setFuse(fuseInstance)
  }, [posts])

  useEffect(() => {
    if (!fuse) return

    if (query.trim() === '') {
      setResults(posts)
    } else {
      const searchResults = fuse.search(query)
      setResults(searchResults.map((result) => result.item))
    }
  }, [query, fuse, posts])

  // Group articles by year for Editorial Library Archive Metaphor
  const groupedByYear = useMemo(() => {
    const groups: Record<string, BlogPost[]> = {}
    results.forEach((post) => {
      const year = post.frontmatter.date
        ? new Date(post.frontmatter.date).getFullYear().toString()
        : 'Archive'
      if (!groups[year]) groups[year] = []
      groups[year].push(post)
    })
    return Object.entries(groups).sort((a, b) => (b[0] === 'Archive' ? -1 : b[0].localeCompare(a[0])))
  }, [results])

  return (
    <div className="space-y-12">
      {/* Editorial Search Bar */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Filter technical writing..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-border/60 bg-card/60 hover:bg-card focus:bg-card focus:border-accent/60 outline-none transition-all duration-200 text-foreground placeholder:text-muted-foreground text-sm shadow-2xs font-mono"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      {/* Editorial Chronological Archive */}
      {groupedByYear.length > 0 ? (
        <div className="space-y-14">
          {groupedByYear.map(([year, yearPosts]) => (
            <div key={year} className="space-y-6">
              <div className="flex items-center gap-4 border-b border-border/60 pb-3">
                <span className="text-xl font-bold font-mono text-foreground tracking-tight">{year}</span>
                <div className="h-px flex-1 bg-border/40" />
                <span className="text-xs font-mono text-muted-foreground">
                  {yearPosts.length} ENTRY{yearPosts.length !== 1 ? 'IES' : ''}
                </span>
              </div>

              <div className="divide-y divide-border/40">
                {yearPosts.map((post, idx) => {
                  const itemNumber = (idx + 1).toString().padStart(2, '0')
                  return (
                    <Link
                      key={post.slug}
                      href={`/articles/${post.slug}`}
                      className="group block py-6 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
                        <div className="flex items-start gap-4 max-w-3xl">
                          <span className="text-xs font-mono text-muted-foreground/70 font-semibold pt-1">
                            {itemNumber}
                          </span>
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-accent transition-colors duration-150">
                              {post.frontmatter.title}
                            </h3>
                            {post.frontmatter.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed font-light">
                                {post.frontmatter.description}
                              </p>
                            )}
                            {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {post.frontmatter.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[10px] px-2 py-0.5 rounded border border-border/50 bg-secondary/30 font-mono text-muted-foreground"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground whitespace-nowrap self-start md:self-baseline">
                          {post.frontmatter.date && (
                            <span>
                              {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          )}
                          <ArrowUpRight className="w-4 h-4 text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 rounded-2xl border border-dashed border-border/60 bg-card/30">
          <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-60" />
          <p className="text-muted-foreground text-sm font-mono">No articles match &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  )
}
