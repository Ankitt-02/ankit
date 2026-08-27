import { getCurrentUserProfile, getPublicProfile } from '@/lib/db/profiles'
import { ProfileForm } from '@/components/admin/profile-form'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  let profile = await getCurrentUserProfile()
  if (!profile) {
    profile = await getPublicProfile()
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Profile & Settings CMS</h1>
        <p className="text-foreground/70">
          Update your developer portfolio bio, avatar, headline, and social connections.
        </p>
      </div>

      <ProfileForm profile={profile} />
    </div>
  )
}
