import { ContentLayout } from '@/components/content-layout'
import { getPublishedProjects } from '@/lib/db/projects'
import Link from 'next/link'
import { ExternalLink, ArrowUpRight, Cpu, Layers } from 'lucide-react'
import { GithubIcon } from '@/components/social-icons'

export const revalidate = 60

export default async function ProjectsPage() {
  const projects = await getPublishedProjects(50)

  return (
    <ContentLayout
      title="Engineering Lab & Workbench"
      description="Systems architecture, technical implementations, and software engineering case studies."
    >
      <div className="space-y-12">
        {projects.length === 0 ? (
          <div className="p-16 rounded-3xl border border-dashed border-border/60 bg-card/30 text-center space-y-3 font-mono">
            <Cpu className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
            <p className="text-foreground font-semibold text-base">No projects published yet.</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              New systems architecture &amp; engineering case studies will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {projects.map((project, idx) => {
              const projectNumber = `#${(idx + 1).toString().padStart(2, '0')}`

              return (
                <div
                  key={project.id}
                  className="group relative p-6 sm:p-8 rounded-2xl border border-border/70 bg-card/60 hover:bg-card hover:border-accent/40 transition-all duration-200 shadow-2xs space-y-6"
                >
                  {/* Top Bar with Workbench Tagging */}
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-accent bg-accent/10 px-2.5 py-1 rounded">
                        {projectNumber}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                        SYSTEM ARCHITECTURE
                      </span>
                    </div>

                    {project.status && (
                      <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                        {project.status}
                      </span>
                    )}
                  </div>

                  {/* Title & Short Description */}
                  <div className="space-y-2">
                    <Link href={`/projects/${project.slug}`} className="group-hover:text-accent transition-colors">
                      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{project.title}</h2>
                    </Link>
                    {project.short_description && (
                      <p className="text-sm sm:text-base text-foreground/85 leading-relaxed font-light">
                        {project.short_description}
                      </p>
                    )}
                  </div>

                  {/* Technology Stack Pills */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
                        Configured Stack
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech.id}
                            className="px-3 py-1 rounded-md border border-border/60 bg-secondary/50 text-xs font-mono text-foreground/90"
                          >
                            {tech.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Architecture & Engineering Details Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 font-mono text-xs">
                    {project.problem && (
                      <div className="p-3.5 rounded-xl border border-border/40 bg-secondary/20 space-y-1">
                        <span className="text-accent font-semibold block uppercase text-[10px]">Problem</span>
                        <p className="text-muted-foreground line-clamp-3 leading-relaxed">{project.problem}</p>
                      </div>
                    )}
                    {project.solution && (
                      <div className="p-3.5 rounded-xl border border-border/40 bg-secondary/20 space-y-1">
                        <span className="text-accent font-semibold block uppercase text-[10px]">Solution</span>
                        <p className="text-muted-foreground line-clamp-3 leading-relaxed">{project.solution}</p>
                      </div>
                    )}
                    {project.architecture && (
                      <div className="p-3.5 rounded-xl border border-border/40 bg-secondary/20 space-y-1">
                        <span className="text-accent font-semibold block uppercase text-[10px]">Architecture</span>
                        <p className="text-muted-foreground line-clamp-3 leading-relaxed">{project.architecture}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/40">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-mono text-xs transition-transform active:scale-[0.98]"
                    >
                      <span>Full Case Study</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>

                    <div className="flex items-center gap-3">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-border/60 hover:bg-secondary text-xs font-mono text-foreground transition-colors"
                        >
                          <GithubIcon size={14} /> Repository
                        </a>
                      )}
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-border/60 hover:bg-secondary text-xs font-mono text-foreground transition-colors"
                        >
                          <ExternalLink size={14} /> Live System
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </ContentLayout>
  )
}
