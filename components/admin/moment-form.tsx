'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Sparkles, AlertCircle, Upload, Image as ImageIcon, X } from 'lucide-react'
import type { MomentWithRelations, Tag } from '@/lib/db/types'
import { createMomentAction, updateMomentAction } from '@/app/admin/moments/actions'
import { uploadMediaAction } from '@/app/admin/media/actions'
import { slugify } from '@/lib/utils'

interface MomentFormProps {
  moment?: MomentWithRelations | null
  availableTags?: Tag[]
}

export function MomentForm({ moment, availableTags = [] }: MomentFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const isEditing = Boolean(moment)

  const [title, setTitle] = useState(moment?.title || '')
  const [slug, setSlug] = useState(moment?.slug || '')
  const [userModifiedSlug, setUserModifiedSlug] = useState(Boolean(moment?.slug))
  const [content, setContent] = useState(moment?.content || '')
  const [location, setLocation] = useState(moment?.location || '')
  const [mood, setMood] = useState(moment?.mood || '')
  
  const defaultEventDate = moment?.event_date
    ? new Date(moment.event_date).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10)
  const [eventDate, setEventDate] = useState(defaultEventDate)

  const [published, setPublished] = useState(moment?.published ?? true)
  const [featured, setFeatured] = useState(moment?.featured ?? false)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(moment?.tags?.map((t) => t.id) || [])
  const [attachedImages, setAttachedImages] = useState<Array<{ id: string; url: string }>>(
    moment?.images?.map((img) => ({ id: img.id, url: img.public_url })) || []
  )

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTitle(val)
    if (!userModifiedSlug) {
      setSlug(slugify(val))
    }
  }

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setError(null)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const uploadData = new FormData()
        uploadData.append('file', file)
        uploadData.append('alt_text', file.name)

        const res = await uploadMediaAction(uploadData)
        if (res.error) {
          setError(res.error)
        } else if (res.media) {
          setAttachedImages((prev) => [...prev, { id: res.media!.id, url: res.media!.public_url }])
        }
      }
    } catch (err: any) {
      console.error('Image upload error:', err)
      setError(err.message || 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = (id: string) => {
    setAttachedImages((prev) => prev.filter((img) => img.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData()
    formData.append('title', title)
    formData.append('slug', slug)
    formData.append('content', content)
    formData.append('location', location)
    formData.append('mood', mood)
    formData.append('event_date', eventDate)
    if (published) formData.append('published', 'true')
    if (featured) formData.append('featured', 'true')

    selectedTagIds.forEach((id) => formData.append('tag_ids', id))
    attachedImages.forEach((img) => formData.append('image_ids', img.id))

    startTransition(async () => {
      let res
      if (isEditing && moment) {
        res = await updateMomentAction(moment.id, null, formData)
      } else {
        res = await createMomentAction(null, formData)
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
            href="/admin/moments"
            className="p-2 rounded-xl border border-border/40 bg-card/50 hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Edit Moment' : 'Create New Moment'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEditing ? `Editing moment: ${moment?.title}` : 'Post an image, snapshot, milestone, or thought'}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || isUploading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 text-sm font-semibold transition-all shadow-sm cursor-pointer"
        >
          <Save size={16} />
          {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Post Moment'}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 text-sm flex items-start gap-3">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Save Failed</p>
            <p className="text-xs">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Caption / Title <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. Random evening in Delhi / Debugging session completed"
              className="w-full px-4 py-2.5 rounded-xl border border-border/60 bg-card text-foreground focus:outline-none focus:border-accent text-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Slug <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center rounded-xl border border-border/60 bg-card overflow-hidden">
              <span className="px-3 text-xs font-mono text-muted-foreground bg-muted/20 border-r border-border/40 py-2.5">
                /moments/
              </span>
              <input
                id="slug"
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setUserModifiedSlug(true)
                  setSlug(slugify(e.target.value))
                }}
                placeholder="delhi-evening-moments"
                className="w-full px-3 py-2.5 bg-transparent focus:outline-none text-foreground text-xs font-mono"
              />
            </div>
          </div>

          {/* Inline Image Dropzone */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Images / Photos
            </label>
            
            <div className="p-4 rounded-2xl border border-dashed border-border/80 bg-card/40 space-y-4">
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-foreground text-xs font-medium cursor-pointer hover:bg-secondary/80 transition-colors">
                  <Upload size={14} />
                  <span>{isUploading ? 'Uploading...' : 'Upload Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isUploading}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-muted-foreground">JPEG, PNG, WebP, GIF supported</span>
              </div>

              {attachedImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {attachedImages.map((img) => (
                    <div key={img.id} className="relative rounded-xl overflow-hidden border border-border/60 group aspect-square">
                      <img src={img.url} alt="Attached moment" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-background/80 text-foreground hover:bg-red-500 hover:text-white transition-colors"
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="location" className="block text-xs font-mono text-muted-foreground">
                Location (Optional)
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Delhi, India"
                className="w-full px-3 py-2 rounded-xl border border-border/60 bg-card text-xs text-foreground focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="mood" className="block text-xs font-mono text-muted-foreground">
                Mood / Tag (Optional)
              </label>
              <input
                id="mood"
                type="text"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="e.g. Focus, Travel"
                className="w-full px-3 py-2 rounded-xl border border-border/60 bg-card text-xs text-foreground focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="event_date" className="block text-xs font-mono text-muted-foreground">
                Event Date
              </label>
              <input
                id="event_date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border/60 bg-card text-xs text-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Content / Story Text (Optional)
            </label>
            <textarea
              id="content"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your story, caption details, or reflections..."
              className="w-full px-4 py-3 rounded-xl border border-border/60 bg-card text-foreground font-mono text-xs leading-relaxed focus:outline-none"
            />
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-border/60 bg-card space-y-4">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
              Status Options
            </h2>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="published" className="text-xs font-medium text-foreground block cursor-pointer">
                  Published
                </label>
                <p className="text-[11px] text-muted-foreground">Visible on public feed</p>
              </div>
              <input
                id="published"
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 rounded border-border/60 text-primary accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="featured" className="text-xs font-medium text-foreground cursor-pointer">
                  Featured
                </label>
                <p className="text-[11px] text-muted-foreground">Highlight on homepage timeline</p>
              </div>
              <input
                id="featured"
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-border/60 text-primary accent-primary cursor-pointer"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="p-5 rounded-2xl border border-border/60 bg-card space-y-3">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
              Tags
            </h2>
            {availableTags.length === 0 ? (
              <p className="text-xs text-muted-foreground font-mono">No tags created yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const selected = selectedTagIds.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer font-mono ${
                        selected
                          ? 'border-neutral-400 bg-secondary text-foreground font-semibold'
                          : 'border-border/40 bg-card/40 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
