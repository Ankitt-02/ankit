'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Plus, Edit2, Trash2, Sparkles, Search, MapPin, Calendar } from 'lucide-react'
import type { MomentWithRelations } from '@/lib/db/types'
import { deleteMomentAction, toggleMomentPublishAction } from '@/app/admin/moments/actions'

interface MomentsListProps {
  initialMoments: MomentWithRelations[]
}

export function MomentsList({ initialMoments }: MomentsListProps) {
  const [moments, setMoments] = useState(initialMoments)
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const filteredMoments = moments.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.slug.toLowerCase().includes(search.toLowerCase()) ||
      (m.content && m.content.toLowerCase().includes(search.toLowerCase())) ||
      (m.location && m.location.toLowerCase().includes(search.toLowerCase()))
  )

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete moment "${title}"?`)) {
      return
    }

    setDeletingId(id)
    setError(null)

    startTransition(async () => {
      const res = await deleteMomentAction(id)
      setDeletingId(null)
      if (res.error) {
        setError(res.error)
      } else {
        setMoments((prev) => prev.filter((m) => m.id !== id))
      }
    })
  }

  const handleTogglePublish = (id: string, currentPublished: boolean) => {
    setError(null)
    startTransition(async () => {
      const res = await toggleMomentPublishAction(id, !currentPublished)
      if (res.error) {
        setError(res.error)
      } else {
        setMoments((prev) =>
          prev.map((m) =>
            m.id === id ? { ...m, published: !currentPublished } : m
          )
        )
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
            placeholder="Search moments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border/40 bg-card/50 focus:bg-card focus:border-accent focus:outline-none transition-colors text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <Link
          href="/admin/moments/new"
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 text-sm font-semibold transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          <Plus size={18} />
          Create Moment
        </Link>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      {filteredMoments.length === 0 ? (
        <div className="p-12 rounded-lg border border-border/40 bg-card/30 text-center space-y-3">
          <p className="text-foreground/70 font-medium">
            {search ? 'No moments matching search.' : 'No moments posted yet.'}
          </p>
          <p className="text-xs text-muted-foreground">
            {search ? 'Try clearing the search query.' : 'Click "Create Moment" above to capture your first developer moment.'}
          </p>
        </div>
      ) : (
        <div className="border border-border/40 rounded-lg overflow-hidden bg-card/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-card/70 border-b border-border/40 text-muted-foreground text-xs uppercase font-mono">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Title / Caption</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Location</th>
                  <th className="py-3.5 px-4 font-semibold">Event Date</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredMoments.map((moment) => {
                  const isDeletingThis = deletingId === moment.id && isPending
                  return (
                    <tr
                      key={moment.id}
                      className={`hover:bg-card/50 transition-colors ${
                        isDeletingThis ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      {/* Title */}
                      <td className="py-4 px-4 max-w-xs sm:max-w-md">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/moments/${moment.id}`}
                              className="font-semibold text-foreground hover:text-accent transition-colors line-clamp-1"
                            >
                              {moment.title}
                            </Link>
                            {moment.featured && (
                              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 font-mono font-medium">
                                <Sparkles size={10} />
                                Featured
                              </span>
                            )}
                          </div>
                          {moment.content && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {moment.content}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(moment.id, moment.published)}
                          disabled={isPending}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                            moment.published
                              ? 'border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                              : 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                          }`}
                        >
                          {moment.published ? 'Published' : 'Draft'}
                        </button>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-muted-foreground font-mono">
                        {moment.location ? (
                          <div className="flex items-center gap-1">
                            <MapPin size={12} className="text-accent" />
                            <span>{moment.location}</span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Event Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-muted-foreground font-mono">
                        {moment.event_date ? (
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>
                              {new Date(moment.event_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/moments/${moment.id}`}
                            title="Edit Moment"
                            className="p-2 rounded-md border border-border/40 hover:border-accent/40 bg-card/50 hover:bg-card text-muted-foreground hover:text-accent transition-colors"
                          >
                            <Edit2 size={15} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(moment.id, moment.title)}
                            disabled={isPending}
                            title="Delete Moment"
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
