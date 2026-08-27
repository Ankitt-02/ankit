'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Sparkles, Eye, AlertCircle } from 'lucide-react'
import type { ProjectWithRelations, Tag, Technology } from '@/lib/db/types'
import { createProjectAction, updateProjectAction } from '@/app/admin/projects/actions'
import { slugify } from '@/lib/utils'

interface ProjectFormProps {
  project?: ProjectWithRelations | null
  availableTags?: Tag[]
  availableTechnologies?: Technology[]
}

export function ProjectForm({ project, availableTags = [], availableTechnologies = [] }: ProjectFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isEditing = Boolean(project)

  const [title, setTitle] = useState(project?.title || '')
  const [slug, setSlug] = useState(project?.slug || '')
  const [userModifiedSlug, setUserModifiedSlug] = useState(Boolean(project?.slug))
  const [shortDescription, setShortDescription] = useState(project?.short_description || '')
  const [overview, setOverview] = useState(project?.overview || '')
  const [problem, setProblem] = useState(project?.problem || '')
  const [solution, setSolution] = useState(project?.solution || '')
  const [architecture, setArchitecture] = useState(project?.architecture || '')
  const [githubUrl, setGithubUrl] = useState(project?.github_url || '')
  const [liveUrl, setLiveUrl] = useState(project?.live_url || '')
  const [published, setPublished] = useState(project?.published ?? false)
  const [featured, setFeatured] = useState(project?.featured ?? false)
  const [seoTitle, setSeoTitle] = useState(project?.seo_title || '')
  const [seoDescription, setSeoDescription] = useState(project?.seo_description || '')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(project?.tags?.map((t) => t.id) || [])
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>(project?.technologies?.map((t) => t.id) || [])

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

  const handleTechToggle = (techId: string) => {
    setSelectedTechIds((prev) =>
      prev.includes(techId) ? prev.filter((id) => id !== techId) : [...prev, techId]
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData()
    formData.append('title', title)
    formData.append('slug', slug)
    formData.append('short_description', shortDescription)
    formData.append('overview', overview)
    formData.append('problem', problem)
    formData.append('solution', solution)
    formData.append('architecture', architecture)
    formData.append('github_url', githubUrl)
    formData.append('live_url', liveUrl)
    if (published) formData.append('published', 'true')
    if (featured) formData.append('featured', 'true')
    formData.append('seo_title', seoTitle)
    formData.append('seo_description', seoDescription)

    selectedTagIds.forEach((id) => formData.append('tag_ids', id))
    selectedTechIds.forEach((id) => formData.append('technology_ids', id))

    startTransition(async () => {
      let res
      if (isEditing && project) {
        res = await updateProjectAction(project.id, null, formData)
      } else {
        res = await createProjectAction(null, formData)
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
            href="/admin/projects"
            className="p-2 rounded-lg border border-border/40 bg-card/50 hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Edit Project' : 'Create New Project'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditing ? `Editing project: ${project?.title}` : 'Fill out details for portfolio showcase'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing && published && (
            <Link
              href={`/projects/${slug}`}
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
            {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Project'}
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
        {/* Main Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-foreground">
              Project Title <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. Distributed Analytics Engine"
              className="w-full px-4 py-2.5 rounded-lg border border-border/40 bg-card/50 focus:bg-card focus:border-accent focus:outline-none transition-colors text-foreground text-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className="block text-sm font-medium text-foreground">
              Slug <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center rounded-lg border border-border/40 bg-card/50 focus-within:border-accent transition-colors overflow-hidden">
              <span className="px-3 text-xs font-mono text-muted-foreground bg-muted/20 border-r border-border/40 py-2.5">
                /projects/
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
                placeholder="distributed-analytics-engine"
                className="w-full px-3 py-2.5 bg-transparent focus:outline-none text-foreground text-sm font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="short_description" className="block text-sm font-medium text-foreground">
              Short Description / Tagline
            </label>
            <textarea
              id="short_description"
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="High-level summary displayed on portfolio cards..."
              className="w-full px-4 py-2.5 rounded-lg border border-border/40 bg-card/50 focus:bg-card focus:border-accent focus:outline-none transition-colors text-foreground text-sm"
            />
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="github_url" className="block text-xs font-medium text-muted-foreground">
                GitHub Repository URL
              </label>
              <input
                id="github_url"
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="w-full px-3 py-2 rounded-lg border border-border/40 bg-card/50 focus:bg-card focus:border-accent focus:outline-none transition-colors text-sm text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="live_url" className="block text-xs font-medium text-muted-foreground">
                Live Demo / Website URL
              </label>
              <input
                id="live_url"
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://myproject.com"
                className="w-full px-3 py-2 rounded-lg border border-border/40 bg-card/50 focus:bg-card focus:border-accent focus:outline-none transition-colors text-sm text-foreground"
              />
            </div>
          </div>

          {/* Sections: Overview, Problem, Solution, Architecture */}
          <div className="space-y-4 pt-4 border-t border-border/40">
            <h2 className="text-base font-semibold text-foreground">Project Case Study Sections</h2>
            
            <div className="space-y-2">
              <label htmlFor="overview" className="block text-xs font-medium text-muted-foreground">
                Overview (Markdown)
              </label>
              <textarea
                id="overview"
                rows={5}
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                placeholder="Detailed project introduction and objectives..."
                className="w-full px-4 py-2.5 rounded-lg border border-border/40 bg-card/50 focus:bg-card focus:border-accent focus:outline-none transition-colors text-foreground font-mono text-xs leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="problem" className="block text-xs font-medium text-muted-foreground">
                Problem Statement (Markdown)
              </label>
              <textarea
                id="problem"
                rows={4}
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="What challenges or issues does this project address?"
                className="w-full px-4 py-2.5 rounded-lg border border-border/40 bg-card/50 focus:bg-card focus:border-accent focus:outline-none transition-colors text-foreground font-mono text-xs leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="solution" className="block text-xs font-medium text-muted-foreground">
                Solution & Implementation Details (Markdown)
              </label>
              <textarea
                id="solution"
                rows={5}
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="Technical solution, key algorithms, performance results..."
                className="w-full px-4 py-2.5 rounded-lg border border-border/40 bg-card/50 focus:bg-card focus:border-accent focus:outline-none transition-colors text-foreground font-mono text-xs leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="architecture" className="block text-xs font-medium text-muted-foreground">
                Architecture & Infrastructure (Markdown)
              </label>
              <textarea
                id="architecture"
                rows={4}
                value={architecture}
                onChange={(e) => setArchitecture(e.target.value)}
                placeholder="System design, database architecture, hosting environment..."
                className="w-full px-4 py-2.5 rounded-lg border border-border/40 bg-card/50 focus:bg-card focus:border-accent focus:outline-none transition-colors text-foreground font-mono text-xs leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Controls: Status, Techs, Tags */}
        <div className="space-y-6">
          {/* Publishing */}
          <div className="p-6 rounded-lg border border-border/40 bg-card/50 space-y-4">
            <h2 className="text-base font-semibold text-foreground border-b border-border/40 pb-3">
              Status & Options
            </h2>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="published" className="text-sm font-medium text-foreground block cursor-pointer">
                  Published
                </label>
                <p className="text-xs text-muted-foreground">Visible on public portfolio</p>
              </div>
              <input
                id="published"
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-5 h-5 rounded border-border/40 text-accent focus:ring-accent accent-accent cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="featured" className="text-sm font-medium text-foreground flex items-center gap-1.5 cursor-pointer">
                  <Sparkles size={14} className="text-yellow-400" />
                  Featured Project
                </label>
                <p className="text-xs text-muted-foreground">Showcase on homepage</p>
              </div>
              <input
                id="featured"
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-5 h-5 rounded border-border/40 text-accent focus:ring-accent accent-accent cursor-pointer"
              />
            </div>
          </div>

          {/* Technologies Multi-select */}
          <div className="p-6 rounded-lg border border-border/40 bg-card/50 space-y-3">
            <h2 className="text-base font-semibold text-foreground border-b border-border/40 pb-3">
              Technologies Used
            </h2>
            {availableTechnologies.length === 0 ? (
              <p className="text-xs text-muted-foreground">No technologies created yet. Manage technologies in CMS.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableTechnologies.map((tech) => {
                  const selected = selectedTechIds.includes(tech.id)
                  return (
                    <button
                      key={tech.id}
                      type="button"
                      onClick={() => handleTechToggle(tech.id)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer font-mono ${
                        selected
                          ? 'border-accent bg-accent/20 text-foreground font-semibold'
                          : 'border-border/40 bg-card/40 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tech.name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Tags Multi-select */}
          <div className="p-6 rounded-lg border border-border/40 bg-card/50 space-y-3">
            <h2 className="text-base font-semibold text-foreground border-b border-border/40 pb-3">
              Tags
            </h2>
            {availableTags.length === 0 ? (
              <p className="text-xs text-muted-foreground">No tags created yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const selected = selectedTagIds.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                        selected
                          ? 'border-accent bg-accent/20 text-foreground font-semibold'
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
