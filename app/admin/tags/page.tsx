import { getAllTags } from '@/lib/db/tags'
import { TagsManager } from '@/components/admin/tags-manager'

export const dynamic = 'force-dynamic'

export default async function AdminTagsPage() {
  const tags = await getAllTags()

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Tags CMS</h1>
        <p className="text-foreground/70">
          Manage tags used to categorize articles, projects, and moments.
        </p>
      </div>

      <TagsManager initialTags={tags} />
    </div>
  )
}
