'use server'

import { revalidatePath } from 'next/cache'
import { createTechnology, updateTechnology, deleteTechnology } from '@/lib/db/technologies'
import type { TechnologyInput } from '@/lib/db/types'
import { isRedirectError } from '@/lib/db/errors'

export interface ActionResponse {
  success?: boolean
  error?: string
  message?: string
}

export async function createTechnologyAction(input: TechnologyInput): Promise<ActionResponse> {
  if (!input.name || !input.name.trim()) {
    return { error: 'Technology name is required' }
  }

  try {
    await createTechnology(input)
    revalidatePath('/admin/technologies')
    revalidatePath('/admin')
    return { success: true, message: 'Technology created successfully' }
  } catch (err: any) {
    if (isRedirectError(err)) throw err
    return { error: err.message || 'Failed to create technology' }
  }
}

export async function updateTechnologyAction(id: string, input: TechnologyInput): Promise<ActionResponse> {
  if (!input.name || !input.name.trim()) {
    return { error: 'Technology name is required' }
  }

  try {
    await updateTechnology(id, input)
    revalidatePath('/admin/technologies')
    revalidatePath('/admin')
    return { success: true, message: 'Technology updated successfully' }
  } catch (err: any) {
    if (isRedirectError(err)) throw err
    return { error: err.message || 'Failed to update technology' }
  }
}

export async function deleteTechnologyAction(id: string): Promise<ActionResponse> {
  try {
    await deleteTechnology(id)
    revalidatePath('/admin/technologies')
    revalidatePath('/admin')
    return { success: true, message: 'Technology deleted successfully' }
  } catch (err: any) {
    return { error: err.message || 'Failed to delete technology' }
  }
}
