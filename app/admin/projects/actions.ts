'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createProject, updateProject, deleteProject, toggleProjectPublish } from '@/lib/db/projects'
import type { ProjectInput } from '@/lib/db/types'
import { isRedirectError } from '@/lib/db/errors'

export interface ActionResponse {
  success?: boolean
  error?: string
  message?: string
}

export async function createProjectAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const title = (formData.get('title') as string || '').trim()
  const slug = (formData.get('slug') as string || '').trim()
  const short_description = (formData.get('short_description') as string || '').trim()
  const overview = (formData.get('overview') as string || '').trim()
  const problem = (formData.get('problem') as string || '').trim()
  const solution = (formData.get('solution') as string || '').trim()
  const architecture = (formData.get('architecture') as string || '').trim()
  const github_url = (formData.get('github_url') as string || '').trim()
  const live_url = (formData.get('live_url') as string || '').trim()
  const cover_image = (formData.get('cover_image') as string || '').trim() || null
  const featured = formData.get('featured') === 'on' || formData.get('featured') === 'true'
  const published = formData.get('published') === 'on' || formData.get('published') === 'true'
  const seo_title = (formData.get('seo_title') as string || '').trim()
  const seo_description = (formData.get('seo_description') as string || '').trim()
  const published_at = (formData.get('published_at') as string || '').trim()

  const tag_ids = formData.getAll('tag_ids').map(s => String(s)).filter(Boolean)
  const technology_ids = formData.getAll('technology_ids').map(s => String(s)).filter(Boolean)
  const image_ids = formData.getAll('image_ids').map(s => String(s)).filter(Boolean)

  if (!title) {
    return { error: 'Project title is required' }
  }

  if (!slug) {
    return { error: 'Project slug is required' }
  }

  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  if (!slugRegex.test(slug)) {
    return { error: 'Slug must contain only lowercase letters, numbers, and hyphens' }
  }

  const projectInput: ProjectInput = {
    title,
    slug,
    short_description: short_description || null,
    overview: overview || null,
    problem: problem || null,
    solution: solution || null,
    architecture: architecture || null,
    github_url: github_url || null,
    live_url: live_url || null,
    cover_image,
    featured,
    published,
    seo_title: seo_title || null,
    seo_description: seo_description || null,
    published_at: published_at || null,
    tag_ids,
    technology_ids,
    image_ids,
  }

  try {
    await createProject(projectInput)
  } catch (err: any) {
    if (isRedirectError(err)) throw err
    return { error: err.message || 'Failed to create project' }
  }

  revalidatePath('/admin/projects')
  revalidatePath('/admin')
  revalidatePath('/projects')
  revalidatePath('/')
  redirect('/admin/projects')
}

export async function updateProjectAction(
  id: string,
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const title = (formData.get('title') as string || '').trim()
  const slug = (formData.get('slug') as string || '').trim()
  const short_description = (formData.get('short_description') as string || '').trim()
  const overview = (formData.get('overview') as string || '').trim()
  const problem = (formData.get('problem') as string || '').trim()
  const solution = (formData.get('solution') as string || '').trim()
  const architecture = (formData.get('architecture') as string || '').trim()
  const github_url = (formData.get('github_url') as string || '').trim()
  const live_url = (formData.get('live_url') as string || '').trim()
  const cover_image = (formData.get('cover_image') as string || '').trim() || null
  const featured = formData.get('featured') === 'on' || formData.get('featured') === 'true'
  const published = formData.get('published') === 'on' || formData.get('published') === 'true'
  const seo_title = (formData.get('seo_title') as string || '').trim()
  const seo_description = (formData.get('seo_description') as string || '').trim()
  const published_at = (formData.get('published_at') as string || '').trim()

  const tag_ids = formData.getAll('tag_ids').map(s => String(s)).filter(Boolean)
  const technology_ids = formData.getAll('technology_ids').map(s => String(s)).filter(Boolean)
  const image_ids = formData.getAll('image_ids').map(s => String(s)).filter(Boolean)

  if (!title) {
    return { error: 'Project title is required' }
  }

  if (!slug) {
    return { error: 'Project slug is required' }
  }

  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  if (!slugRegex.test(slug)) {
    return { error: 'Slug must contain only lowercase letters, numbers, and hyphens' }
  }

  const projectInput: ProjectInput = {
    title,
    slug,
    short_description: short_description || null,
    overview: overview || null,
    problem: problem || null,
    solution: solution || null,
    architecture: architecture || null,
    github_url: github_url || null,
    live_url: live_url || null,
    cover_image,
    featured,
    published,
    seo_title: seo_title || null,
    seo_description: seo_description || null,
    published_at: published_at || null,
    tag_ids,
    technology_ids,
    image_ids,
  }

  try {
    await updateProject(id, projectInput)
  } catch (err: any) {
    if (isRedirectError(err)) throw err
    return { error: err.message || 'Failed to update project' }
  }

  revalidatePath('/admin/projects')
  revalidatePath('/admin')
  revalidatePath('/projects')
  revalidatePath(`/projects/${slug}`)
  revalidatePath('/')
  redirect('/admin/projects')
}

export async function toggleProjectPublishAction(id: string, publish: boolean): Promise<ActionResponse> {
  try {
    await toggleProjectPublish(id, publish)
    revalidatePath('/admin/projects')
    revalidatePath('/admin')
    revalidatePath('/projects')
    revalidatePath('/')
    return { success: true, message: `Project ${publish ? 'published' : 'unpublished'} successfully` }
  } catch (err: any) {
    return { error: err.message || 'Failed to toggle publish status' }
  }
}

export async function deleteProjectAction(id: string): Promise<ActionResponse> {
  try {
    await deleteProject(id)
    revalidatePath('/admin/projects')
    revalidatePath('/admin')
    revalidatePath('/projects')
    revalidatePath('/')
    return { success: true, message: 'Project deleted successfully' }
  } catch (err: any) {
    return { error: err.message || 'Failed to delete project' }
  }
}
