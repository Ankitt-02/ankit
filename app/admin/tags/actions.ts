'use server'

import { revalidatePath } from 'next/cache'
import { createTag, updateTag, deleteTag } from '@/lib/db/tags'
import type { TagInput } from '@/lib/db/types'
import { isRedirectError } from '@/lib/db/errors'

export interface ActionResponse {
  success?: boolean
  error?: string
  message?: string
}

export async function createTagAction(input: TagInput): Promise<ActionResponse> {
  if (!input.name || !input.name.trim()) {
    return { error: 'Tag name is required' }
  }

  try {
    await createTag(input)
    revalidatePath('/admin/tags')
    revalidatePath('/admin')
    return { success: true, message: 'Tag created successfully' }
  } catch (err: any) {
    if (isRedirectError(err)) throw err
    return { error: err.message || 'Failed to create tag' }
  }
}

export async function updateTagAction(id: string, input: TagInput): Promise<ActionResponse> {
  if (!input.name || !input.name.trim()) {
    return { error: 'Tag name is required' }
  }

  try {
    await updateTag(id, input)
    revalidatePath('/admin/tags')
    revalidatePath('/admin')
    return { success: true, message: 'Tag updated successfully' }
  } catch (err: any) {
    if (isRedirectError(err)) throw err
    return { error: err.message || 'Failed to update tag' }
  }
}

export async function deleteTagAction(id: string): Promise<ActionResponse> {
  try {
    await deleteTag(id)
    revalidatePath('/admin/tags')
    revalidatePath('/admin')
    return { success: true, message: 'Tag deleted successfully' }
  } catch (err: any) {
    return { error: err.message || 'Failed to delete tag' }
  }
}
