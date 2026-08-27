import { getAllMedia } from '@/lib/db/media'
import { MediaManager } from '@/components/admin/media-manager'

export const dynamic = 'force-dynamic'

export default async function AdminMediaPage() {
  const mediaList = await getAllMedia()

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Media CMS</h1>
        <p className="text-foreground/70">
          Upload, manage, preview, and organize files stored in your Supabase Storage bucket.
        </p>
      </div>

      <MediaManager initialMedia={mediaList} />
    </div>
  )
}
