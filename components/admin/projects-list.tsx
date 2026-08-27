'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Plus, Edit2, Trash2, Sparkles, Search, ExternalLink } from 'lucide-react'
import { GithubIcon } from '@/components/social-icons'
import type { ProjectWithRelations } from '@/lib/db/types'
import { deleteProjectAction, toggleProjectPublishAction } from '@/app/admin/projects/actions'

interface ProjectsListProps {
  initialProjects: ProjectWithRelations[]
}

export function ProjectsList({ initialProjects }: ProjectsListProps) {
  const [projects, setProjects] = useState(initialProjects)
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      (p.short_description && p.short_description.toLowerCase().includes(search.toLowerCase()))
  )

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete project "${title}"? This action cannot be undone.`)) {
      return
    }

    setDeletingId(id)
    setError(null)

    startTransition(async () => {
      const res = await deleteProjectAction(id)
      setDeletingId(null)
      if (res.error) {
        setError(res.error)
      } else {
        setProjects((prev) => prev.filter((p) => p.id !== id))
      }
    })
  }

  const handleTogglePublish = (id: string, currentPublished: boolean) => {
    setError(null)
    startTransition(async () => {
      const res = await toggleProjectPublishAction(id, !currentPublished)
      if (res.error) {
        setError(res.error)
      } else {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, published: !currentPublished, status: !currentPublished ? 'published' : 'draft' } : p
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
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border/40 bg-card/50 focus:bg-card focus:border-accent focus:outline-none transition-colors text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <Link
          href="/admin/projects/new"
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 text-sm font-semibold transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          <Plus size={18} />
          Create Project
        </Link>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 rounded-lg border border-border/40 bg-card/30 text-center space-y-3">
          <p className="text-foreground/70 font-medium">
            {search ? 'No projects matching search.' : 'No projects created yet.'}
          </p>
          <p className="text-xs text-muted-foreground">
            {search ? 'Try clearing the search query.' : 'Click "Create Project" above to add your first project.'}
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
                  <th className="py-3.5 px-4 font-semibold">Technologies</th>
                  <th className="py-3.5 px-4 font-semibold">Links</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredProjects.map((project) => {
                  const isDeletingThis = deletingId === project.id && isPending
                  return (
                    <tr
                      key={project.id}
                      className={`hover:bg-card/50 transition-colors ${
                        isDeletingThis ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      {/* Title */}
                      <td className="py-4 px-4 max-w-xs sm:max-w-md">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/projects/${project.id}`}
                              className="font-semibold text-foreground hover:text-accent transition-colors line-clamp-1"
                            >
                              {project.title}
                            </Link>
                            {project.featured && (
                              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 font-mono font-medium">
                                <Sparkles size={10} />
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground font-mono truncate">
                            /projects/{project.slug}
                          </p>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(project.id, project.published)}
                          disabled={isPending}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                            project.published
                              ? 'border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                              : 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                          }`}
                        >
                          {project.published ? 'Published' : 'Draft'}
                        </button>
                      </td>

                      {/* Technologies */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {project.technologies && project.technologies.length > 0 ? (
                            project.technologies.slice(0, 3).map((t) => (
                              <span
                                key={t.id}
                                className="text-[10px] px-2 py-0.5 rounded bg-card border border-border/40 text-foreground/80 font-mono"
                              >
                                {t.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground font-mono">—</span>
                          )}
                          {project.technologies && project.technologies.length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 text-muted-foreground">
                              +{project.technologies.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Links */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs">
                        <div className="flex items-center gap-2">
                          {project.github_url && (
                            <a
                              href={project.github_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-muted-foreground hover:text-foreground"
                              title="GitHub Repository"
                            >
                              <GithubIcon size={15} />
                            </a>
                          )}
                          {project.live_url && (
                            <a
                              href={project.live_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-muted-foreground hover:text-foreground"
                              title="Live Demo"
                            >
                              <ExternalLink size={15} />
                            </a>
                          )}
                          {!project.github_url && !project.live_url && (
                            <span className="text-muted-foreground font-mono">—</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {project.published && (
                            <Link
                              href={`/projects/${project.slug}`}
                              target="_blank"
                              title="View Public Page"
                              className="p-2 rounded-md border border-border/40 hover:border-accent/40 bg-card/50 hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <ExternalLink size={15} />
                            </Link>
                          )}
                          <Link
                            href={`/admin/projects/${project.id}`}
                            title="Edit Project"
                            className="p-2 rounded-md border border-border/40 hover:border-accent/40 bg-card/50 hover:bg-card text-muted-foreground hover:text-accent transition-colors"
                          >
                            <Edit2 size={15} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(project.id, project.title)}
                            disabled={isPending}
                            title="Delete Project"
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
