'use server'

import { revalidatePath } from 'next/cache'
import { updateProfile } from '@/lib/db/profiles'
import { isRedirectError } from '@/lib/db/errors'

export interface ActionResponse {
  success?: boolean
  error?: string
  message?: string
}

export async function updateProfileAction(formData: FormData): Promise<ActionResponse> {
  const name = (formData.get('name') as string || '').trim()
  const email = (formData.get('email') as string || '').trim()
  const bio = (formData.get('bio') as string || '').trim()
  const headline = (formData.get('headline') as string || '').trim()
  const avatar_url = (formData.get('avatar_url') as string || '').trim()
  const resume_url = (formData.get('resume_url') as string || '').trim()
  const education = (formData.get('education') as string || '').trim()
  const detailed_bio = (formData.get('detailed_bio') as string || '').trim()
  const engineering_interests = (formData.get('engineering_interests') as string || '').trim()
  const personal_interests = (formData.get('personal_interests') as string || '').trim()
  const website = (formData.get('website') as string || '').trim()
  const github = (formData.get('github') as string || '').trim()
  const linkedin = (formData.get('linkedin') as string || '').trim()
  const instagram = (formData.get('instagram') as string || '').trim()
  const twitter = (formData.get('twitter') as string || '').trim()

  try {
    await updateProfile({
      name: name || null,
      email: email || null,
      bio: bio || null,
      headline: headline || null,
      avatar_url: avatar_url || null,
      resume_url: resume_url || null,
      education: education || null,
      detailed_bio: detailed_bio || null,
      engineering_interests: engineering_interests || null,
      personal_interests: personal_interests || null,
      website: website || null,
      github: github || null,
      linkedin: linkedin || null,
      instagram: instagram || null,
      twitter: twitter || null,
    })

    revalidatePath('/admin/settings')
    revalidatePath('/me')
    revalidatePath('/')
    return { success: true, message: 'Profile updated successfully' }
  } catch (err: any) {
    if (isRedirectError(err)) throw err
    return { error: err.message || 'Failed to update profile' }
  }
}
