'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createMoment, updateMoment, deleteMoment, toggleMomentPublish } from '@/lib/db/moments'
import type { MomentInput } from '@/lib/db/types'
import { isRedirectError } from '@/lib/db/errors'

export interface ActionResponse {
  success?: boolean
  error?: string
  message?: string
}

export async function createMomentAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const title = (formData.get('title') as string || '').trim()
  const slug = (formData.get('slug') as string || '').trim()
  const content = (formData.get('content') as string || '').trim()
  const location = (formData.get('location') as string || '').trim()
  const mood = (formData.get('mood') as string || '').trim()
  const event_date = (formData.get('event_date') as string || '').trim()
  const featured = formData.get('featured') === 'on' || formData.get('featured') === 'true'
  const published = formData.get('published') === 'on' || formData.get('published') === 'true'
  const published_at = (formData.get('published_at') as string || '').trim()

  const tag_ids = formData.getAll('tag_ids').map(s => String(s)).filter(Boolean)
  const image_ids = formData.getAll('image_ids').map(s => String(s)).filter(Boolean)

  if (!title) {
    return { error: 'Moment title/caption is required' }
  }

  if (!slug) {
    return { error: 'Moment slug is required' }
  }

  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  if (!slugRegex.test(slug)) {
    return { error: 'Slug must contain only lowercase letters, numbers, and hyphens' }
  }

  const momentInput: MomentInput = {
    title,
    slug,
    content: content || null,
    location: location || null,
    mood: mood || null,
    event_date: event_date || null,
    featured,
    published,
    published_at: published_at || null,
    tag_ids,
    image_ids,
  }

  try {
    await createMoment(momentInput)
  } catch (err: any) {
    if (isRedirectError(err)) throw err
    return { error: err.message || 'Failed to create moment' }
  }

  revalidatePath('/admin/moments')
  revalidatePath('/admin')
  revalidatePath('/moments')
  revalidatePath('/')
  redirect('/admin/moments')
}

export async function updateMomentAction(
  id: string,
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const title = (formData.get('title') as string || '').trim()
  const slug = (formData.get('slug') as string || '').trim()
  const content = (formData.get('content') as string || '').trim()
  const location = (formData.get('location') as string || '').trim()
  const mood = (formData.get('mood') as string || '').trim()
  const event_date = (formData.get('event_date') as string || '').trim()
  const featured = formData.get('featured') === 'on' || formData.get('featured') === 'true'
  const published = formData.get('published') === 'on' || formData.get('published') === 'true'
  const published_at = (formData.get('published_at') as string || '').trim()

  const tag_ids = formData.getAll('tag_ids').map(s => String(s)).filter(Boolean)
  const image_ids = formData.getAll('image_ids').map(s => String(s)).filter(Boolean)

  if (!title) {
    return { error: 'Moment title/caption is required' }
  }

  if (!slug) {
    return { error: 'Moment slug is required' }
  }

  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  if (!slugRegex.test(slug)) {
    return { error: 'Slug must contain only lowercase letters, numbers, and hyphens' }
  }

  const momentInput: MomentInput = {
    title,
    slug,
    content: content || null,
    location: location || null,
    mood: mood || null,
    event_date: event_date || null,
    featured,
    published,
    published_at: published_at || null,
    tag_ids,
    image_ids,
  }

  try {
    await updateMoment(id, momentInput)
  } catch (err: any) {
    if (isRedirectError(err)) throw err
    return { error: err.message || 'Failed to update moment' }
  }

  revalidatePath('/admin/moments')
  revalidatePath('/admin')
  revalidatePath('/moments')
  revalidatePath('/')
  redirect('/admin/moments')
}

export async function toggleMomentPublishAction(id: string, publish: boolean): Promise<ActionResponse> {
  try {
    await toggleMomentPublish(id, publish)
    revalidatePath('/admin/moments')
    revalidatePath('/admin')
    revalidatePath('/moments')
    revalidatePath('/')
    return { success: true, message: `Moment ${publish ? 'published' : 'unpublished'} successfully` }
  } catch (err: any) {
    return { error: err.message || 'Failed to toggle publish status' }
  }
}

export async function deleteMomentAction(id: string): Promise<ActionResponse> {
  try {
    await deleteMoment(id)
    revalidatePath('/admin/moments')
    revalidatePath('/admin')
    revalidatePath('/moments')
    revalidatePath('/')
    return { success: true, message: 'Moment deleted successfully' }
  } catch (err: any) {
    return { error: err.message || 'Failed to delete moment' }
  }
}
