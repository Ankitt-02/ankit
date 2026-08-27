'use server'

import { revalidatePath } from 'next/cache'
import { uploadMedia, deleteMedia } from '@/lib/db/media'
import type { Media } from '@/lib/db/types'

export interface MediaActionResponse {
  success?: boolean
  error?: string
  message?: string
  media?: Media
}

export async function uploadMediaAction(formData: FormData): Promise<MediaActionResponse> {
  const file = formData.get('file') as File
  const altText = (formData.get('alt_text') as string || '').trim()

  if (!file || file.size === 0) {
    return { error: 'Please select a valid file to upload' }
  }

  try {
    const media = await uploadMedia(file, altText)
    revalidatePath('/admin/media')
    revalidatePath('/admin')
    return { success: true, media, message: 'File uploaded successfully' }
  } catch (err: any) {
    return { error: err.message || 'Upload failed' }
  }
}

export async function deleteMediaAction(id: string): Promise<MediaActionResponse> {
  try {
    await deleteMedia(id)
    revalidatePath('/admin/media')
    revalidatePath('/admin')
    return { success: true, message: 'Media deleted successfully' }
  } catch (err: any) {
    return { error: err.message || 'Failed to delete media' }
  }
}
