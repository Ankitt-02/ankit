import { getAllTechnologies } from '@/lib/db/technologies'
import { TechnologiesManager } from '@/components/admin/technologies-manager'

export const dynamic = 'force-dynamic'

export default async function AdminTechnologiesPage() {
  const technologies = await getAllTechnologies()

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Technologies CMS</h1>
        <p className="text-foreground/70">
          Manage technologies and tech stack items used across your projects.
        </p>
      </div>

      <TechnologiesManager initialTechnologies={technologies} />
    </div>
  )
}
