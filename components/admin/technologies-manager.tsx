'use client'

import { useState, useTransition } from 'react'
import { Plus, Edit2, Trash2, Cpu, Search } from 'lucide-react'
import type { Technology } from '@/lib/db/types'
import { createTechnologyAction, updateTechnologyAction, deleteTechnologyAction } from '@/app/admin/technologies/actions'
import { slugify } from '@/lib/utils'

interface TechnologiesManagerProps {
  initialTechnologies: Technology[]
}

export function TechnologiesManager({ initialTechnologies }: TechnologiesManagerProps) {
  const [technologies, setTechnologies] = useState(initialTechnologies)
  const [search, setSearch] = useState('')
  
  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTech, setEditingTech] = useState<Technology | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState('Frontend')
  const [userModifiedSlug, setUserModifiedSlug] = useState(false)

  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const filteredTechnologies = technologies.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()) ||
      (t.category && t.category.toLowerCase().includes(search.toLowerCase()))
  )

  const openCreateModal = () => {
    setEditingTech(null)
    setName('')
    setSlug('')
    setCategory('Frontend')
    setUserModifiedSlug(false)
    setError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (tech: Technology) => {
    setEditingTech(tech)
    setName(tech.name)
    setSlug(tech.slug)
    setCategory(tech.category || 'Frontend')
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
      if (editingTech) {
        res = await updateTechnologyAction(editingTech.id, { name, slug, category })
      } else {
        res = await createTechnologyAction({ name, slug, category })
      }

      if (res.error) {
        setError(res.error)
      } else {
        setIsModalOpen(false)
        window.location.reload()
      }
    })
  }

  const handleDelete = (id: string, techName: string) => {
    if (!confirm(`Are you sure you want to delete technology "${techName}"?`)) {
      return
    }

    setError(null)
    startTransition(async () => {
      const res = await deleteTechnologyAction(id)
      if (res.error) {
        setError(res.error)
      } else {
        setTechnologies((prev) => prev.filter((t) => t.id !== id))
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
            placeholder="Search technologies..."
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
          Create Technology
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Technologies List */}
      {filteredTechnologies.length === 0 ? (
        <div className="p-12 rounded-lg border border-border/40 bg-card/30 text-center space-y-3">
          <p className="text-foreground/70 font-medium">
            {search ? 'No technologies matching search.' : 'No technologies created yet.'}
          </p>
          <p className="text-xs text-muted-foreground">
            Technologies are reusable across portfolio projects.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTechnologies.map((tech) => (
            <div
              key={tech.id}
              className="p-4 rounded-xl border border-border/40 bg-card/40 flex items-center justify-between hover:border-accent/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Cpu size={18} className="text-accent flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{tech.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">/{tech.slug}</span>
                    {tech.category && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted/40 text-foreground/70">
                        {tech.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(tech)}
                  className="p-1.5 rounded hover:bg-card/80 text-muted-foreground hover:text-accent transition-colors cursor-pointer"
                  title="Edit Technology"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(tech.id, tech.name)}
                  disabled={isPending}
                  className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
                  title="Delete Technology"
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
              {editingTech ? 'Edit Technology' : 'Create New Technology'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-muted-foreground">
                  Technology Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. PostgreSQL"
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
                  placeholder="postgresql"
                  className="w-full px-3 py-2 rounded-lg border border-border/40 bg-card/50 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-muted-foreground">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border/40 bg-card/50 text-xs text-foreground focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Database">Database</option>
                  <option value="DevOps">DevOps & Cloud</option>
                  <option value="Language">Language</option>
                  <option value="Framework">Framework</option>
                  <option value="General">General</option>
                </select>
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
                  {isPending ? 'Saving...' : editingTech ? 'Save Changes' : 'Create Tech'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
