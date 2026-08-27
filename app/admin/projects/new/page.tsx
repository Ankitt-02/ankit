import { getAllTags } from '@/lib/db/tags'
import { getAllTechnologies } from '@/lib/db/technologies'
import { ProjectForm } from '@/components/admin/project-form'

export const dynamic = 'force-dynamic'

export default async function CreateProjectPage() {
  const [tags, technologies] = await Promise.all([
    getAllTags(),
    getAllTechnologies(),
  ])

  return <ProjectForm availableTags={tags} availableTechnologies={technologies} />
}
