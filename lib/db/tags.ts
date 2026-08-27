import { createServerClient } from '@/lib/supabase/server';
import type { Tag, TagInput } from './types';
import { slugify } from '@/lib/utils';

export async function getAllTags(): Promise<Tag[]> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const supabase = await createServerClient();
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data) {
        return data;
      }
    } catch (err) {
      if (attempt === 1) console.error('[DB Tags] getAllTags catch:', err);
    }
  }
  return [];
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data;
}

export async function createTag(input: TagInput): Promise<Tag> {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required to create tags');
  }

  const formattedSlug = input.slug ? slugify(input.slug) : slugify(input.name);

  const { data, error } = await supabase
    .from('tags')
    .insert({
      name: input.name.trim(),
      slug: formattedSlug,
      color: input.color || null,
    })
    .select()
    .single();

  if (error) {
    console.error('[DB Tags] createTag error:', error);
    throw new Error(`Failed to create tag: ${error.message}`);
  }

  return data;
}

export async function updateTag(id: string, input: TagInput): Promise<Tag> {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required to update tags');
  }

  const formattedSlug = input.slug ? slugify(input.slug) : slugify(input.name);

  const { data, error } = await supabase
    .from('tags')
    .update({
      name: input.name.trim(),
      slug: formattedSlug,
      color: input.color || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[DB Tags] updateTag error:', error);
    throw new Error(`Failed to update tag: ${error.message}`);
  }

  return data;
}

export async function deleteTag(id: string): Promise<boolean> {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required to delete tags');
  }

  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[DB Tags] deleteTag error:', error);
    throw new Error(`Failed to delete tag: ${error.message}`);
  }

  return true;
}
