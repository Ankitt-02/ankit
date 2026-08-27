import Link from 'next/link'
import { getPublicProfile } from '@/lib/db/profiles'
import { getFeaturedProjects, getPublishedProjects } from '@/lib/db/projects'
import { getPublishedArticles, getFeaturedArticles } from '@/lib/db/articles'
import { getFeaturedMoments, getPublishedMoments } from '@/lib/db/moments'
import { getAllTechnologies } from '@/lib/db/technologies'
import { HeroSection } from '@/components/hero-section'
import { ArrowUpRight, FolderGit2, Calendar, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const profile = await getPublicProfile()
  
  const [featuredProjects, publishedArticles, featuredMoments, technologies] = await Promise.all([
    getFeaturedProjects(3),
    getFeaturedArticles(3),
    getFeaturedMoments(3),
    getAllTechnologies(),
  ])

  const projectsList = featuredProjects.length > 0 ? featuredProjects : (await getPublishedProjects(3))
  const articlesList = publishedArticles.length > 0 ? publishedArticles : (await getPublishedArticles(3))
  const momentsList = featuredMoments.length > 0 ? featuredMoments : (await getPublishedMoments(3))

  const name = 'Ankit'
  const headline = profile?.headline || 'Software engineer building applications and technical architecture.'
  const bio = profile?.bio || 'Documenting software engineering decisions, system design, and personal notes.'

  return (
    <div className="min-h-screen text-foreground transition-colors duration-300">
      <div className="mx-auto max-w-5xl px-6">
        {/* Signature Interactive Hero Terminal Section */}
        <HeroSection
          name={name}
          headline={headline}
          bio={bio}
          projects={projectsList}
          articles={articlesList}
          moments={momentsList}
          profile={profile}
        />

        {/* Featured Projects */}
        <section className="py-12 border-t border-border/40 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1 text-xs font-mono font-medium text-foreground hover:text-accent transition-colors"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {projectsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projectsList.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="group block p-6 rounded-2xl border border-border/60 bg-card/70 hover:bg-card hover:border-neutral-400 dark:hover:border-neutral-500 transition-all duration-200 shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs font-mono text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <FolderGit2 className="w-3.5 h-3.5" />
                        <span>Case Study</span>
                      </span>
                    </div>

                    <h3 className="text-lg font-bold group-hover:text-accent transition-colors">
                      {project.title}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {project.short_description || project.overview || 'Explore implementation details.'}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {project.technologies.slice(0, 3).map((t) => (
                        <span key={t.id} className="px-2 py-0.5 rounded bg-secondary text-foreground/80 font-mono text-[10px]">
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-border/60 bg-card/20 text-center">
              <p className="text-muted-foreground text-xs font-mono">No projects published yet.</p>
            </div>
          )}
        </section>

        {/* Articles Section */}
        <section className="py-12 border-t border-border/40 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Articles</h2>
            </div>
            <Link
              href="/articles"
              className="inline-flex items-center gap-1 text-xs font-mono font-medium text-foreground hover:text-accent transition-colors"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {articlesList.length > 0 ? (
            <div className="space-y-3">
              {articlesList.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="group block p-5 rounded-xl border border-border/60 bg-card/70 hover:bg-card hover:border-neutral-400 dark:hover:border-neutral-500 transition-all duration-200 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      {article.published_at && (
                        <p className="text-xs text-muted-foreground font-mono">
                          {new Date(article.published_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      )}
                      <h3 className="text-base font-bold group-hover:text-accent transition-colors">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                          {article.excerpt}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-mono text-accent flex items-center gap-1 self-start sm:self-center">
                      Read →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-border/60 bg-card/20 text-center">
              <p className="text-muted-foreground text-xs font-mono">No published articles yet.</p>
            </div>
          )}
        </section>

        {/* Moments Showcase with Image Collage Grids & Unified Layout */}
        {momentsList.length > 0 && (
          <section className="py-12 border-t border-border/40 mb-12 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Moments</h2>
              </div>
              <Link
                href="/moments"
                className="inline-flex items-center gap-1 text-xs font-mono font-medium text-foreground hover:text-accent transition-colors"
              >
                <span>Timeline</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {momentsList.map((moment) => {
                const images = moment.images || []
                const hasSingleImage = images.length === 1
                const hasMultipleImages = images.length > 1

                return (
                  <Link
                    key={moment.id}
                    href="/moments"
                    className="group block p-5 rounded-2xl border border-border/60 bg-card/70 hover:bg-card hover:border-neutral-400 dark:hover:border-neutral-500 transition-all duration-200 space-y-3 shadow-sm"
                  >
                    {/* Unified Image Display: Single or Collage Grid */}
                    {hasSingleImage && (
                      <div className="overflow-hidden rounded-xl border border-border/50 bg-black/20">
                        <img
                          src={images[0].public_url}
                          alt={images[0].alt_text || moment.title}
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      </div>
                    )}

                    {hasMultipleImages && (
                      <div className="grid grid-cols-2 gap-1.5 overflow-hidden rounded-xl border border-border/50 bg-black/20 p-1">
                        {images.slice(0, 4).map((img, idx) => (
                          <div key={img.id || idx} className="overflow-hidden rounded-lg">
                            <img
                              src={img.public_url}
                              alt={img.alt_text || moment.title}
                              className="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Moment Header & Content */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold group-hover:text-accent transition-colors">
                          {moment.title}
                        </h3>
                        {moment.mood && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-foreground/80 font-mono whitespace-nowrap">
                            {moment.mood}
                          </span>
                        )}
                      </div>

                      {moment.content && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {moment.content}
                        </p>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono pt-1">
                      {moment.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {moment.location}
                        </span>
                      )}
                      {moment.event_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(moment.event_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
