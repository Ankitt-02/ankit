import { notFound } from 'next/navigation'
import { getProjectByIdAdmin } from '@/lib/db/projects'
import { getAllTags } from '@/lib/db/tags'
import { getAllTechnologies } from '@/lib/db/technologies'
import { ProjectForm } from '@/components/admin/project-form'

export const dynamic = 'force-dynamic'

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [project, tags, technologies] = await Promise.all([
    getProjectByIdAdmin(id),
    getAllTags(),
    getAllTechnologies(),
  ])

  if (!project) {
    notFound()
  }

  return (
    <ProjectForm
      project={project}
      availableTags={tags}
      availableTechnologies={technologies}
    />
  )
}
