'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createArticle, updateArticle, deleteArticle, toggleArticlePublish } from '@/lib/db/articles'
import type { ArticleInput } from '@/lib/db/types'
import { isRedirectError } from '@/lib/db/errors'

export interface ActionResponse {
  success?: boolean
  error?: string
  message?: string
}

export async function createArticleAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const title = (formData.get('title') as string || '').trim()
  const slug = (formData.get('slug') as string || '').trim()
  const excerpt = (formData.get('excerpt') as string || '').trim()
  const content = (formData.get('content') as string || '').trim()
  const cover_image = (formData.get('cover_image') as string || '').trim() || null
  const featured = formData.get('featured') === 'on' || formData.get('featured') === 'true'
  const published = formData.get('published') === 'on' || formData.get('published') === 'true'
  const seo_title = (formData.get('seo_title') as string || '').trim()
  const seo_description = (formData.get('seo_description') as string || '').trim()
  const published_at = (formData.get('published_at') as string || '').trim()

  const tag_ids = formData.getAll('tag_ids').map(s => String(s)).filter(Boolean)
  const image_ids = formData.getAll('image_ids').map(s => String(s)).filter(Boolean)

  if (!title) {
    return { error: 'Article title is required' }
  }

  if (!slug) {
    return { error: 'Article slug is required' }
  }

  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  if (!slugRegex.test(slug)) {
    return { error: 'Slug must contain only lowercase letters, numbers, and hyphens (e.g. my-article-slug)' }
  }

  const articleInput: ArticleInput = {
    title,
    slug,
    excerpt: excerpt || null,
    content: content || null,
    cover_image,
    featured,
    published,
    seo_title: seo_title || null,
    seo_description: seo_description || null,
    published_at: published_at || null,
    tag_ids,
    image_ids,
  }

  try {
    await createArticle(articleInput)
  } catch (err: any) {
    if (isRedirectError(err)) throw err
    return { error: err.message || 'Failed to create article' }
  }

  revalidatePath('/admin/articles')
  revalidatePath('/admin')
  revalidatePath('/articles')
  revalidatePath('/')
  redirect('/admin/articles')
}

export async function updateArticleAction(
  id: string,
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const title = (formData.get('title') as string || '').trim()
  const slug = (formData.get('slug') as string || '').trim()
  const excerpt = (formData.get('excerpt') as string || '').trim()
  const content = (formData.get('content') as string || '').trim()
  const cover_image = (formData.get('cover_image') as string || '').trim() || null
  const featured = formData.get('featured') === 'on' || formData.get('featured') === 'true'
  const published = formData.get('published') === 'on' || formData.get('published') === 'true'
  const seo_title = (formData.get('seo_title') as string || '').trim()
  const seo_description = (formData.get('seo_description') as string || '').trim()
  const published_at = (formData.get('published_at') as string || '').trim()

  const tag_ids = formData.getAll('tag_ids').map(s => String(s)).filter(Boolean)
  const image_ids = formData.getAll('image_ids').map(s => String(s)).filter(Boolean)

  if (!title) {
    return { error: 'Article title is required' }
  }

  if (!slug) {
    return { error: 'Article slug is required' }
  }

  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  if (!slugRegex.test(slug)) {
    return { error: 'Slug must contain only lowercase letters, numbers, and hyphens (e.g. my-article-slug)' }
  }

  const articleInput: ArticleInput = {
    title,
    slug,
    excerpt: excerpt || null,
    content: content || null,
    cover_image,
    featured,
    published,
    seo_title: seo_title || null,
    seo_description: seo_description || null,
    published_at: published_at || null,
    tag_ids,
    image_ids,
  }

  try {
    await updateArticle(id, articleInput)
  } catch (err: any) {
    if (isRedirectError(err)) throw err
    return { error: err.message || 'Failed to update article' }
  }

  revalidatePath('/admin/articles')
  revalidatePath('/admin')
  revalidatePath('/articles')
  revalidatePath(`/articles/${slug}`)
  revalidatePath('/')
  redirect('/admin/articles')
}

export async function toggleArticlePublishAction(id: string, publish: boolean): Promise<ActionResponse> {
  try {
    await toggleArticlePublish(id, publish)
    revalidatePath('/admin/articles')
    revalidatePath('/admin')
    revalidatePath('/articles')
    revalidatePath('/')
    return { success: true, message: `Article ${publish ? 'published' : 'unpublished'} successfully` }
  } catch (err: any) {
    return { error: err.message || 'Failed to toggle publish status' }
  }
}

export async function deleteArticleAction(id: string): Promise<ActionResponse> {
  try {
    await deleteArticle(id)
    revalidatePath('/admin/articles')
    revalidatePath('/admin')
    revalidatePath('/articles')
    revalidatePath('/')
    return { success: true, message: 'Article deleted successfully' }
  } catch (err: any) {
    return { error: err.message || 'Failed to delete article' }
  }
}
