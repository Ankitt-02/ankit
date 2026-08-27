import { getAllProjectsAdmin } from '@/lib/db/projects'
import { ProjectsList } from '@/components/admin/projects-list'

export const dynamic = 'force-dynamic'

export default async function AdminProjectsPage() {
  const projects = await getAllProjectsAdmin()

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Projects CMS</h1>
        <p className="text-foreground/70">
          Create, edit, manage, and publish your portfolio projects.
        </p>
      </div>

      <ProjectsList initialProjects={projects} />
    </div>
  )
}
