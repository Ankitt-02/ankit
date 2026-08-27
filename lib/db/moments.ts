import { createServerClient } from '@/lib/supabase/server';
import type { Moment, MomentInput, MomentWithRelations } from './types';
import { slugify } from '@/lib/utils';

function extractUniqueTags(itemTags: any[]): any[] {
  if (!Array.isArray(itemTags)) return [];
  const raw = itemTags.map((t: any) => t.tag).filter((t: any) => t && t.id && t.name);
  return Array.from(new Map(raw.map((t: any) => [t.id, t])).values());
}

function extractUniqueImages(itemImages: any[]): any[] {
  if (!Array.isArray(itemImages)) return [];
  const raw = itemImages.map((i: any) => i.media).filter((i: any) => i && i.id && i.public_url);
  return Array.from(new Map(raw.map((i: any) => [i.id, i])).values());
}

export async function getPublishedMoments(limit: number = 20, offset: number = 0): Promise<MomentWithRelations[]> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const supabase = await createServerClient();
      
      const { data, error } = await supabase
        .from('moments')
        .select(`
          *,
          author:author_id(*),
          tags:moment_tags(tag:tag_id(*)),
          images:moment_images(media:media_id(*))
        `)
        .eq('published', true)
        .order('event_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!error && data) {
        return data.map((item: any) => ({
          ...item,
          author: item.author || null,
          tags: extractUniqueTags(item.tags),
          images: extractUniqueImages(item.images),
        }));
      }
    } catch (err) {
      if (attempt === 1) console.error('[DB Moments] getPublishedMoments catch:', err);
    }
  }
  return [];
}

export async function getFeaturedMoments(limit: number = 3): Promise<MomentWithRelations[]> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const supabase = await createServerClient();
      
      const { data, error } = await supabase
        .from('moments')
        .select(`
          *,
          author:author_id(*),
          tags:moment_tags(tag:tag_id(*)),
          images:moment_images(media:media_id(*))
        `)
        .eq('published', true)
        .eq('featured', true)
        .order('event_date', { ascending: false, nullsFirst: false })
        .limit(limit);

      if (!error && data) {
        return data.map((item: any) => ({
          ...item,
          author: item.author || null,
          tags: extractUniqueTags(item.tags),
          images: extractUniqueImages(item.images),
        }));
      }
    } catch (err) {
      if (attempt === 1) console.error('[DB Moments] getFeaturedMoments catch:', err);
    }
  }
  return [];
}

export async function getAllMomentsAdmin(): Promise<MomentWithRelations[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('moments')
    .select(`
      *,
      author:author_id(*),
      tags:moment_tags(tag:tag_id(*)),
      images:moment_images(media:media_id(*))
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[DB Moments] getAllMomentsAdmin error:', error);
    return [];
  }

  if (!data) return [];

  return data.map((item: any) => ({
    ...item,
    author: item.author || null,
    tags: extractUniqueTags(item.tags),
    images: extractUniqueImages(item.images),
  }));
}

export async function getMomentByIdAdmin(id: string): Promise<MomentWithRelations | null> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('moments')
    .select(`
      *,
      author:author_id(*),
      tags:moment_tags(tag:tag_id(*)),
      images:moment_images(media:media_id(*))
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    if (error && error.code !== 'PGRST116') {
      console.error('[DB Moments] getMomentByIdAdmin error:', error);
    }
    return null;
  }

  return {
    ...data,
    author: data.author || null,
    tags: extractUniqueTags(data.tags),
    images: extractUniqueImages(data.images),
  };
}

export async function createMoment(input: MomentInput): Promise<Moment> {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required to create moments');
  }

  // Ensure profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.from('profiles').insert({
      id: user.id,
      email: user.email || '',
      name: user.email ? user.email.split('@')[0] : 'Author',
    });
  }

  const isPublished = Boolean(input.published);
  const formattedSlug = input.slug ? slugify(input.slug) : slugify(input.title);
  const publishedAt = isPublished
    ? (input.published_at ? new Date(input.published_at).toISOString() : new Date().toISOString())
    : (input.published_at ? new Date(input.published_at).toISOString() : null);

  const { data, error } = await supabase
    .from('moments')
    .insert({
      author_id: user.id,
      title: input.title.trim(),
      slug: formattedSlug,
      content: input.content || null,
      location: input.location || null,
      mood: input.mood || null,
      event_date: input.event_date ? new Date(input.event_date).toISOString() : null,
      published: isPublished,
      featured: Boolean(input.featured),
      published_at: publishedAt,
    })
    .select()
    .single();

  if (error) {
    console.error('[DB Moments] createMoment error:', error);
    throw new Error(`Failed to create moment: ${error.message}`);
  }

  // Sync Tags
  if (input.tag_ids && input.tag_ids.length > 0) {
    const tagRows = input.tag_ids.map((tagId) => ({
      moment_id: data.id,
      tag_id: tagId,
    }));
    await supabase.from('moment_tags').insert(tagRows);
  }

  // Sync Images
  if (input.image_ids && input.image_ids.length > 0) {
    const imageRows = input.image_ids.map((mediaId, idx) => ({
      moment_id: data.id,
      media_id: mediaId,
      display_order: idx,
    }));
    await supabase.from('moment_images').insert(imageRows);
  }

  return data;
}

export async function updateMoment(id: string, input: MomentInput): Promise<Moment> {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required to update moments');
  }

  const isPublished = Boolean(input.published);
  const formattedSlug = input.slug ? slugify(input.slug) : slugify(input.title);
  const publishedAt = isPublished
    ? (input.published_at ? new Date(input.published_at).toISOString() : new Date().toISOString())
    : (input.published_at ? new Date(input.published_at).toISOString() : null);

  const { data, error } = await supabase
    .from('moments')
    .update({
      title: input.title.trim(),
      slug: formattedSlug,
      content: input.content || null,
      location: input.location || null,
      mood: input.mood || null,
      event_date: input.event_date ? new Date(input.event_date).toISOString() : null,
      published: isPublished,
      featured: Boolean(input.featured),
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[DB Moments] updateMoment error:', error);
    throw new Error(`Failed to update moment: ${error.message}`);
  }

  // Sync Tags
  if (input.tag_ids !== undefined) {
    await supabase.from('moment_tags').delete().eq('moment_id', id);
    if (input.tag_ids.length > 0) {
      const tagRows = input.tag_ids.map((tagId) => ({
        moment_id: id,
        tag_id: tagId,
      }));
      await supabase.from('moment_tags').insert(tagRows);
    }
  }

  // Sync Images
  if (input.image_ids !== undefined) {
    await supabase.from('moment_images').delete().eq('moment_id', id);
    if (input.image_ids.length > 0) {
      const imageRows = input.image_ids.map((mediaId, idx) => ({
        moment_id: id,
        media_id: mediaId,
        display_order: idx,
      }));
      await supabase.from('moment_images').insert(imageRows);
    }
  }

  return data;
}

export async function toggleMomentPublish(id: string, publish: boolean): Promise<Moment> {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const { data, error } = await supabase
    .from('moments')
    .update({
      published: publish,
      published_at: publish ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[DB Moments] toggleMomentPublish error:', error);
    throw new Error(`Failed to toggle publish state: ${error.message}`);
  }

  return data;
}

export async function deleteMoment(id: string): Promise<boolean> {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required to delete moments');
  }

  const { error } = await supabase
    .from('moments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[DB Moments] deleteMoment error:', error);
    throw new Error(`Failed to delete moment: ${error.message}`);
  }

  return true;
}
