import { createServerClient } from '@/lib/supabase/server';
import type { Technology, TechnologyInput } from './types';
import { slugify } from '@/lib/utils';

export async function getAllTechnologies(): Promise<Technology[]> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const supabase = await createServerClient();
      const { data, error } = await supabase
        .from('technologies')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data) {
        return data;
      }
    } catch (err) {
      if (attempt === 1) console.error('[DB Technologies] getAllTechnologies catch:', err);
    }
  }
  return [];
}

export async function createTechnology(input: TechnologyInput): Promise<Technology> {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required to create technologies');
  }

  const formattedSlug = input.slug ? slugify(input.slug) : slugify(input.name);

  const { data, error } = await supabase
    .from('technologies')
    .insert({
      name: input.name.trim(),
      slug: formattedSlug,
      category: input.category || null,
      icon_url: input.icon_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error('[DB Technologies] createTechnology error:', error);
    throw new Error(`Failed to create technology: ${error.message}`);
  }

  return data;
}

export async function updateTechnology(id: string, input: TechnologyInput): Promise<Technology> {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required to update technologies');
  }

  const formattedSlug = input.slug ? slugify(input.slug) : slugify(input.name);

  const { data, error } = await supabase
    .from('technologies')
    .update({
      name: input.name.trim(),
      slug: formattedSlug,
      category: input.category || null,
      icon_url: input.icon_url || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[DB Technologies] updateTechnology error:', error);
    throw new Error(`Failed to update technology: ${error.message}`);
  }

  return data;
}

export async function deleteTechnology(id: string): Promise<boolean> {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required to delete technologies');
  }

  const { error } = await supabase
    .from('technologies')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[DB Technologies] deleteTechnology error:', error);
    throw new Error(`Failed to delete technology: ${error.message}`);
  }

  return true;
}
