'use client'

import { useState, useTransition } from 'react'
import { Plus, Edit2, Trash2, Tag as TagIcon, Search } from 'lucide-react'
import type { Tag } from '@/lib/db/types'
import { createTagAction, updateTagAction, deleteTagAction } from '@/app/admin/tags/actions'
import { slugify } from '@/lib/utils'

interface TagsManagerProps {
  initialTags: Tag[]
}

export function TagsManager({ initialTags }: TagsManagerProps) {
  const [tags, setTags] = useState(initialTags)
  const [search, setSearch] = useState('')
  
  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [userModifiedSlug, setUserModifiedSlug] = useState(false)

  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const filteredTags = tags.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase())
  )

  const openCreateModal = () => {
    setEditingTag(null)
    setName('')
    setSlug('')
    setColor('#3b82f6')
    setUserModifiedSlug(false)
    setError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (tag: Tag) => {
    setEditingTag(tag)
    setName(tag.name)
    setSlug(tag.slug)
    setColor(tag.color || '#3b82f6')
    setUserModifiedSlug(true)
    setError(null)
    setIsModalOpen(true)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setName(val)
    if (!userModifiedSlug) {
      setSlug(slugify(val))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      let res
      if (editingTag) {
        res = await updateTagAction(editingTag.id, { name, slug, color })
      } else {
        res = await createTagAction({ name, slug, color })
      }

      if (res.error) {
        setError(res.error)
      } else {
        setIsModalOpen(false)
        window.location.reload()
      }
    })
  }

  const handleDelete = (id: string, tagName: string) => {
    if (!confirm(`Are you sure you want to delete tag "${tagName}"?`)) {
      return
    }

    setError(null)
    startTransition(async () => {
      const res = await deleteTagAction(id)
      if (res.error) {
        setError(res.error)
      } else {
        setTags((prev) => prev.filter((t) => t.id !== id))
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
            placeholder="Search tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border/40 bg-card/50 focus:bg-card focus:border-accent focus:outline-none transition-colors text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 text-sm font-semibold transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          <Plus size={18} />
          Create Tag
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Tags List */}
      {filteredTags.length === 0 ? (
        <div className="p-12 rounded-lg border border-border/40 bg-card/30 text-center space-y-3">
          <p className="text-foreground/70 font-medium">
            {search ? 'No tags matching search.' : 'No tags created yet.'}
          </p>
          <p className="text-xs text-muted-foreground">
            Tags are shared across articles, projects, and moments.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTags.map((tag) => (
            <div
              key={tag.id}
              className="p-4 rounded-xl border border-border/40 bg-card/40 flex items-center justify-between hover:border-accent/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full border border-border/40 flex-shrink-0"
                  style={{ backgroundColor: tag.color || '#3b82f6' }}
                />
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{tag.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">/{tag.slug}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(tag)}
                  className="p-1.5 rounded hover:bg-card/80 text-muted-foreground hover:text-accent transition-colors cursor-pointer"
                  title="Edit Tag"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(tag.id, tag.name)}
                  disabled={isPending}
                  className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
                  title="Delete Tag"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/40 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold">
              {editingTag ? 'Edit Tag' : 'Create New Tag'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-muted-foreground">
                  Tag Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. Next.js"
                  className="w-full px-3 py-2 rounded-lg border border-border/40 bg-card/50 text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-muted-foreground">
                  Slug <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setUserModifiedSlug(true)
                    setSlug(slugify(e.target.value))
                  }}
                  placeholder="nextjs"
                  className="w-full px-3 py-2 rounded-lg border border-border/40 bg-card/50 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-muted-foreground">
                  Tag Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded border border-border/40 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-border/40 bg-card/50 text-xs font-mono text-foreground"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-border/40 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent/90 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? 'Saving...' : editingTag ? 'Save Changes' : 'Create Tag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
