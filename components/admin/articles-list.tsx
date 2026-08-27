'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Plus, Edit2, Trash2, Eye, Sparkles, Clock, Search, ExternalLink } from 'lucide-react'
import type { ArticleWithAuthor } from '@/lib/db/types'
import { deleteArticleAction } from '@/app/admin/articles/actions'

interface ArticlesListProps {
  initialArticles: ArticleWithAuthor[]
}

export function ArticlesList({ initialArticles }: ArticlesListProps) {
  const [articles, setArticles] = useState(initialArticles)
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const filteredArticles = articles.filter(
    (art) =>
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.slug.toLowerCase().includes(search.toLowerCase()) ||
      (art.excerpt && art.excerpt.toLowerCase().includes(search.toLowerCase()))
  )

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete article "${title}"? This cannot be undone.`)) {
      return
    }

    setDeletingId(id)
    setError(null)

    startTransition(async () => {
      const res = await deleteArticleAction(id)
      setDeletingId(null)
      if (res.error) {
        setError(res.error)
      } else {
        setArticles((prev) => prev.filter((a) => a.id !== id))
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search articles by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border/40 bg-card/50 focus:bg-card focus:border-accent focus:outline-none transition-colors text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <Link
          href="/admin/articles/new"
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 text-sm font-semibold transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          <Plus size={18} />
          Create Article
        </Link>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Articles Table / List */}
      {filteredArticles.length === 0 ? (
        <div className="p-12 rounded-lg border border-border/40 bg-card/30 text-center space-y-3">
          <p className="text-foreground/70 font-medium">
            {search ? 'No articles matching your search criteria.' : 'No articles created yet.'}
          </p>
          <p className="text-xs text-muted-foreground">
            {search ? 'Try clearing the search input.' : 'Click "Create Article" above to publish your first article.'}
          </p>
        </div>
      ) : (
        <div className="border border-border/40 rounded-lg overflow-hidden bg-card/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-card/70 border-b border-border/40 text-muted-foreground text-xs uppercase font-mono">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Title</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Reading Time</th>
                  <th className="py-3.5 px-4 font-semibold">Published Date</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredArticles.map((article) => {
                  const isDeletingThis = deletingId === article.id && isPending
                  return (
                    <tr
                      key={article.id}
                      className={`hover:bg-card/50 transition-colors ${
                        isDeletingThis ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      {/* Title & Slug */}
                      <td className="py-4 px-4 max-w-xs sm:max-w-md">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/articles/${article.id}`}
                              className="font-semibold text-foreground hover:text-accent transition-colors line-clamp-1"
                            >
                              {article.title}
                            </Link>
                            {article.featured && (
                              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 font-mono font-medium">
                                <Sparkles size={10} />
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground font-mono truncate">
                            /articles/{article.slug}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {article.published && article.status === 'published' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-green-500/40 bg-green-500/10 text-green-400">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-amber-500/40 bg-amber-500/10 text-amber-400">
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Reading Time */}
                      <td className="py-4 px-4 whitespace-nowrap text-muted-foreground text-xs font-mono">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-muted-foreground" />
                          <span>{article.reading_time || 1} min read</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-muted-foreground font-mono">
                        {article.published_at
                          ? new Date(article.published_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Not published'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {article.published && article.status === 'published' && (
                            <Link
                              href={`/articles/${article.slug}`}
                              target="_blank"
                              title="View Public Page"
                              className="p-2 rounded-md border border-border/40 hover:border-accent/40 bg-card/50 hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <ExternalLink size={15} />
                            </Link>
                          )}
                          <Link
                            href={`/admin/articles/${article.id}`}
                            title="Edit Article"
                            className="p-2 rounded-md border border-border/40 hover:border-accent/40 bg-card/50 hover:bg-card text-muted-foreground hover:text-accent transition-colors"
                          >
                            <Edit2 size={15} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(article.id, article.title)}
                            disabled={isPending}
                            title="Delete Article"
                            className="p-2 rounded-md border border-border/40 hover:border-red-500/40 bg-card/50 hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
