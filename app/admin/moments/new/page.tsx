import { getAllTags } from '@/lib/db/tags'
import { MomentForm } from '@/components/admin/moment-form'

export const dynamic = 'force-dynamic'

export default async function CreateMomentPage() {
  const tags = await getAllTags()
  return <MomentForm availableTags={tags} />
}
