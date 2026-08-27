import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProjectBySlug } from '@/lib/db/projects'
import { renderMarkdownToHtml } from '@/lib/markdown'
import { ArrowLeft, ExternalLink, Sparkles, FolderGit2 } from 'lucide-react'
import { GithubIcon } from '@/components/social-icons'

export const dynamic = 'force-dynamic'

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project || !project.published || project.status !== 'published') {
    notFound()
  }

  const overviewHtml = project.overview ? await renderMarkdownToHtml(project.overview) : ''
  const problemHtml = project.problem ? await renderMarkdownToHtml(project.problem) : ''
  const solutionHtml = project.solution ? await renderMarkdownToHtml(project.solution) : ''
  const architectureHtml = project.architecture ? await renderMarkdownToHtml(project.architecture) : ''

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="mx-auto max-w-4xl px-6 py-12 md:py-20">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to projects</span>
        </Link>

        <article className="space-y-10">
          {/* Header */}
          <header className="space-y-4 pb-8 border-b border-border/40">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <FolderGit2 className="w-4 h-4 text-accent" />
              <span>ENGINEERING CASE STUDY</span>
            </div>

            {project.featured && (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-500 font-medium">
                <Sparkles size={12} />
                Featured System
              </span>
            )}

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
              {project.title}
            </h1>

            {project.short_description && (
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
                {project.short_description}
              </p>
            )}

            {/* Technologies */}
            {project.technologies && project.technologies.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech.id}
                    className="px-3 py-1 rounded-lg border border-border/60 bg-secondary/50 text-xs font-mono text-foreground font-medium"
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            )}

            {/* External Links */}
            <div className="flex gap-4 pt-4 flex-wrap">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-full border border-border/60 hover:border-border bg-card hover:bg-secondary transition-all text-xs font-medium flex items-center gap-2"
                >
                  <GithubIcon size={15} /> Repository
                </a>
              )}
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-full border border-accent/40 bg-accent/10 hover:bg-accent/20 transition-all text-xs font-medium text-foreground flex items-center gap-2"
                >
                  <ExternalLink size={15} /> Live System
                </a>
              )}
            </div>
          </header>

          {/* Case Study Sections */}
          {overviewHtml && (
            <section className="space-y-3">
              <h2 className="text-xl md:text-2xl font-bold border-b border-border/30 pb-2">Overview</h2>
              <div
                className="prose-content"
                dangerouslySetInnerHTML={{ __html: overviewHtml }}
              />
            </section>
          )}

          {problemHtml && (
            <section className="space-y-3">
              <h2 className="text-xl md:text-2xl font-bold border-b border-border/30 pb-2">Problem Statement</h2>
              <div
                className="prose-content"
                dangerouslySetInnerHTML={{ __html: problemHtml }}
              />
            </section>
          )}

          {solutionHtml && (
            <section className="space-y-3">
              <h2 className="text-xl md:text-2xl font-bold border-b border-border/30 pb-2">Solution & Implementation</h2>
              <div
                className="prose-content"
                dangerouslySetInnerHTML={{ __html: solutionHtml }}
              />
            </section>
          )}

          {architectureHtml && (
            <section className="space-y-3">
              <h2 className="text-xl md:text-2xl font-bold border-b border-border/30 pb-2">Architecture & System Design</h2>
              <div
                className="prose-content"
                dangerouslySetInnerHTML={{ __html: architectureHtml }}
              />
            </section>
          )}
        </article>
      </div>
    </div>
  )
}
