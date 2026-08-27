import { getAllMomentsAdmin } from '@/lib/db/moments'
import { MomentsList } from '@/components/admin/moments-list'

export const dynamic = 'force-dynamic'

export default async function AdminMomentsPage() {
  const moments = await getAllMomentsAdmin()

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Moments CMS</h1>
        <p className="text-foreground/70">
          Capture, manage, and share developer milestones and timeline updates.
        </p>
      </div>

      <MomentsList initialMoments={moments} />
    </div>
  )
}
