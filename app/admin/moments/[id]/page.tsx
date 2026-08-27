import { notFound } from 'next/navigation'
import { getMomentByIdAdmin } from '@/lib/db/moments'
import { getAllTags } from '@/lib/db/tags'
import { MomentForm } from '@/components/admin/moment-form'

export const dynamic = 'force-dynamic'

export default async function EditMomentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [moment, tags] = await Promise.all([
    getMomentByIdAdmin(id),
    getAllTags(),
  ])

  if (!moment) {
    notFound()
  }

  return <MomentForm moment={moment} availableTags={tags} />
}
