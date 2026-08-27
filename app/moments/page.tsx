import { ContentLayout } from '@/components/content-layout'
import { getPublishedMoments } from '@/lib/db/moments'
import { getAllTags } from '@/lib/db/tags'
import { Calendar, MapPin } from 'lucide-react'

export const revalidate = 60

export default async function MomentsPage() {
  const [moments, tags] = await Promise.all([
    getPublishedMoments(50),
    getAllTags(),
  ])

  return (
    <ContentLayout title="Moments">
      <div className="space-y-12">
        {/* Organic Photographic Contact Sheet Timeline */}
        <div className="space-y-12">
          {moments.length > 0 ? (
            moments.map((moment) => {
              const images = moment.images || []
              const hasSingleImage = images.length === 1
              const hasMultipleImages = images.length > 1

              return (
                <article
                  key={moment.id}
                  className="group p-6 sm:p-8 rounded-3xl border border-border/60 bg-card/60 transition-colors duration-200 space-y-5 shadow-2xs"
                >
                  {/* Single or Multi-Image Collage Contact Sheet Layout */}
                  {hasSingleImage && (
                    <div className="rounded-2xl overflow-hidden border border-border/50 bg-black/20 flex items-center justify-center p-1">
                      <img
                        src={images[0].public_url}
                        alt={images[0].alt_text || moment.title}
                        className="w-full h-auto max-h-[650px] object-contain rounded-xl"
                      />
                    </div>
                  )}

                  {hasMultipleImages && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl overflow-hidden border border-border/50 bg-black/20 p-1.5">
                      {images.map((img) => (
                        <div key={img.id} className="rounded-xl overflow-hidden bg-black/40">
                          <img
                            src={img.public_url}
                            alt={img.alt_text || moment.title}
                            className="w-full h-auto max-h-[480px] object-contain rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Header & Meta */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        {moment.title}
                      </h2>

                      {moment.mood && (
                        <span className="self-start sm:self-center text-xs px-2.5 py-0.5 rounded-md border border-border/60 bg-secondary text-foreground/80 font-mono">
                          {moment.mood}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                      {moment.event_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(moment.event_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                      {moment.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {moment.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {moment.content && (
                    <p className="text-sm sm:text-base text-foreground/90 leading-relaxed font-normal pt-1 whitespace-pre-wrap">
                      {moment.content}
                    </p>
                  )}

                  {/* Tags */}
                  {moment.tags && moment.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border/40">
                      {moment.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="text-xs px-2.5 py-0.5 rounded-md border border-border/60 bg-secondary/30 text-muted-foreground font-mono"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              )
            })
          ) : (
            <div className="py-16 rounded-3xl border border-dashed border-border/60 bg-card/20 text-center font-mono space-y-2">
              <p className="text-foreground font-medium text-base">No moments posted yet.</p>
            </div>
          )}
        </div>

        {/* Tags Browse Section */}
        {tags.length > 0 && (
          <div className="pt-8 border-t border-border/40">
            <h3 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 rounded-lg border border-border/60 bg-card text-xs font-mono text-foreground/80 cursor-default"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </ContentLayout>
  )
}
