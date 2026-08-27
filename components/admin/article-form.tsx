'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Save, Sparkles, Eye, AlertCircle } from 'lucide-react'
import type { Article } from '@/lib/db/types'
import { createArticleAction, updateArticleAction } from '@/app/admin/articles/actions'

interface ArticleFormProps {
  article?: Article | null
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function ArticleForm({ article }: ArticleFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isEditing = Boolean(article)

  const [title, setTitle] = useState(article?.title || '')
  const [slug, setSlug] = useState(article?.slug || '')
  const [userModifiedSlug, setUserModifiedSlug] = useState(Boolean(article?.slug))
  const [excerpt, setExcerpt] = useState(article?.excerpt || '')
  const [content, setContent] = useState(article?.content || '')
  const [published, setPublished] = useState(article?.published ?? false)
  const [featured, setFeatured] = useState(article?.featured ?? false)
  const [seoTitle, setSeoTitle] = useState(article?.seo_title || '')
  const [seoDescription, setSeoDescription] = useState(article?.seo_description || '')
  
  // Format published_at for datetime-local input
  const defaultPublishedAt = article?.published_at
    ? new Date(article.published_at).toISOString().slice(0, 16)
    : ''
  const [publishedAt, setPublishedAt] = useState(defaultPublishedAt)

  // Auto calculate word count & reading time
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length
  const readingTime = content.trim() ? Math.max(1, Math.ceil(wordCount / 200)) : 0

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    if (!userModifiedSlug) {
      setSlug(slugify(newTitle))
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserModifiedSlug(true)
    setSlug(slugify(e.target.value))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData()
    formData.append('title', title)
    formData.append('slug', slug)
    formData.append('excerpt', excerpt)
    formData.append('content', content)
    if (published) formData.append('published', 'true')
    if (featured) formData.append('featured', 'true')
    formData.append('seo_title', seoTitle)
    formData.append('seo_description', seoDescription)
    if (publishedAt) formData.append('published_at', publishedAt)

    startTransition(async () => {
      let res
      if (isEditing && article) {
        res = await updateArticleAction(article.id, null, formData)
      } else {
        res = await createArticleAction(null, formData)
      }

      if (res?.error) {
        setError(res.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/articles"
            className="p-2 rounded-lg border border-border/40 bg-card/50 hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Edit Article' : 'Create New Article'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditing
                ? `Editing article ID: ${article?.id}`
                : 'Fill out details to create a new blog article'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing && published && (
            <Link
              href={`/articles/${slug}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/40 bg-card/50 hover:bg-card text-foreground/80 hover:text-foreground text-sm font-medium transition-colors"
            >
              <Eye size={16} />
              View Public
            </Link>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Save size={16} />
            {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Article'}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 text-sm flex items-start gap-3">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Save Failed</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-foreground">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. Building Scalable Web Applications with Next.js"
              className="w-full px-4 py-2.5 rounded-lg border border-border/40 bg-card/50 focus:bg-card focus:border-accent focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="slug" className="block text-sm font-medium text-foreground">
                Slug <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setSlug(slugify(title))
                  setUserModifiedSlug(false)
                }}
                className="text-xs text-accent hover:underline cursor-pointer"
              >
                Regenerate from title
              </button>
            </div>
            <div className="flex items-center rounded-lg border border-border/40 bg-card/50 focus-within:border-accent transition-colors overflow-hidden">
              <span className="px-3 text-xs font-mono text-muted-foreground bg-muted/20 border-r border-border/40 py-2.5">
                /articles/
              </span>
              <input
                id="slug"
                type="text"
                required
                value={slug}
                onChange={handleSlugChange}
                placeholder="building-scalable-web-applications"
                className="w-full px-3 py-2.5 bg-transparent focus:outline-none text-foreground text-sm font-mono placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <label htmlFor="excerpt" className="block text-sm font-medium text-foreground">
              Excerpt / Summary
            </label>
            <textarea
              id="excerpt"
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief summary of the article for lists and social cards..."
              className="w-full px-4 py-2.5 rounded-lg border border-border/40 bg-card/50 focus:bg-card focus:border-accent focus:outline-none transition-colors text-foreground text-sm placeholder:text-muted-foreground"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="content" className="block text-sm font-medium text-foreground">
                Article Content (Markdown)
              </label>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{wordCount} words</span>
                <span className="flex items-center gap-1 font-medium text-accent">
                  <Clock size={12} />
                  {readingTime} min read
                </span>
              </div>
            </div>
            <textarea
              id="content"
              rows={16}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article in Markdown..."
              className="w-full px-4 py-3 rounded-lg border border-border/40 bg-card/50 focus:bg-card focus:border-accent focus:outline-none transition-colors text-foreground font-mono text-sm leading-relaxed placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          {/* Publishing Controls */}
          <div className="p-6 rounded-lg border border-border/40 bg-card/50 space-y-5">
            <h2 className="text-base font-semibold text-foreground border-b border-border/40 pb-3">
              Publishing Options
            </h2>

            {/* Published Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="published" className="text-sm font-medium text-foreground block cursor-pointer">
                  Published
                </label>
                <p className="text-xs text-muted-foreground">
                  Make accessible on public website
                </p>
              </div>
              <input
                id="published"
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-5 h-5 rounded border-border/40 text-accent focus:ring-accent accent-accent cursor-pointer"
              />
            </div>

            {/* Featured Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="featured" className="text-sm font-medium text-foreground flex items-center gap-1.5 cursor-pointer">
                  <Sparkles size={14} className="text-yellow-400" />
                  Featured Article
                </label>
                <p className="text-xs text-muted-foreground">
                  Highlight on homepage feed
                </p>
              </div>
              <input
                id="featured"
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-5 h-5 rounded border-border/40 text-accent focus:ring-accent accent-accent cursor-pointer"
              />
            </div>

            {/* Published At Date Picker */}
            <div className="space-y-2 pt-2">
              <label htmlFor="published_at" className="block text-xs font-medium text-muted-foreground">
                Publish Date & Time
              </label>
              <input
                id="published_at"
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border/40 bg-card/50 focus:bg-card focus:border-accent focus:outline-none transition-colors text-xs text-foreground"
              />
              <p className="text-[11px] text-muted-foreground">
                Defaults to current timestamp when published if left blank.
              </p>
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="p-6 rounded-lg border border-border/40 bg-card/50 space-y-4">
            <h2 className="text-base font-semibold text-foreground border-b border-border/40 pb-3">
              SEO Metadata
            </h2>

            <div className="space-y-2">
              <label htmlFor="seo_title" className="block text-xs font-medium text-muted-foreground">
                SEO Title
              </label>
              <input
                id="seo_title"
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Custom title for search engines"
                className="w-full px-3 py-2 rounded-lg border border-border/40 bg-card/50 focus:bg-card focus:border-accent focus:outline-none transition-colors text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="seo_description" className="block text-xs font-medium text-muted-foreground">
                SEO Description
              </label>
              <textarea
                id="seo_description"
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Search engine meta description..."
                className="w-full px-3 py-2 rounded-lg border border-border/40 bg-card/50 focus:bg-card focus:border-accent focus:outline-none transition-colors text-xs text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
