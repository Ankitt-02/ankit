import { createServerClient } from '@/lib/supabase/server';
import type { Project, ProjectInput, ProjectWithRelations } from './types';
import { slugify } from '@/lib/utils';

export async function getPublishedProjects(limit: number = 10, offset: number = 0): Promise<ProjectWithRelations[]> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const supabase = await createServerClient();
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          author:author_id(*),
          cover:media!cover_image(*),
          tags:project_tags(tag:tag_id(*)),
          technologies:project_technologies(technology:technology_id(*)),
          images:project_images(media:media_id(*))
        `)
        .eq('published', true)
        .eq('status', 'published')
        .order('published_at', { ascending: false, nullsFirst: false })
        .range(offset, offset + limit - 1);

      if (!error && data) {
        return data.map((item: any) => ({
          ...item,
          author: item.author || null,
          cover: item.cover || null,
          tags: item.tags?.map((t: any) => t.tag).filter(Boolean) || [],
          technologies: item.technologies?.map((t: any) => t.technology).filter(Boolean) || [],
          images: item.images?.map((i: any) => i.media).filter(Boolean) || [],
        }));
      }
    } catch (err) {
      if (attempt === 1) console.error('[DB Projects] getPublishedProjects catch:', err);
    }
  }
  return [];
}

export async function getFeaturedProjects(limit: number = 3): Promise<ProjectWithRelations[]> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const supabase = await createServerClient();
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          author:author_id(*),
          cover:media!cover_image(*),
          tags:project_tags(tag:tag_id(*)),
          technologies:project_technologies(technology:technology_id(*)),
          images:project_images(media:media_id(*))
        `)
        .eq('published', true)
        .eq('featured', true)
        .eq('status', 'published')
        .order('published_at', { ascending: false, nullsFirst: false })
        .limit(limit);

      if (!error && data) {
        return data.map((item: any) => ({
          ...item,
          author: item.author || null,
          cover: item.cover || null,
          tags: item.tags?.map((t: any) => t.tag).filter(Boolean) || [],
          technologies: item.technologies?.map((t: any) => t.technology).filter(Boolean) || [],
          images: item.images?.map((i: any) => i.media).filter(Boolean) || [],
        }));
      }
    } catch (err) {
      if (attempt === 1) console.error('[DB Projects] getFeaturedProjects catch:', err);
    }
  }
  return [];
}

export async function getProjectBySlug(slug: string): Promise<ProjectWithRelations | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const supabase = await createServerClient();
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          author:author_id(*),
          cover:media!cover_image(*),
          tags:project_tags(tag:tag_id(*)),
          technologies:project_technologies(technology:technology_id(*)),
          images:project_images(media:media_id(*))
        `)
        .eq('slug', slug)
        .eq('published', true)
        .eq('status', 'published')
        .single();

      if (!error && data) {
        return {
          ...data,
          author: data.author || null,
          cover: data.cover || null,
          tags: data.tags?.map((t: any) => t.tag).filter(Boolean) || [],
          technologies: data.technologies?.map((t: any) => t.technology).filter(Boolean) || [],
          images: data.images?.map((i: any) => i.media).filter(Boolean) || [],
        };
      }
    } catch (err) {
      if (attempt === 1) console.error('[DB Projects] getProjectBySlug catch:', err);
    }
  }
  return null;
}

export async function getAllProjectsAdmin(): Promise<ProjectWithRelations[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      author:author_id(*),
      cover:media!cover_image(*),
      tags:project_tags(tag:tag_id(*)),
      technologies:project_technologies(technology:technology_id(*)),
      images:project_images(media:media_id(*))
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[DB Projects] getAllProjectsAdmin error:', error);
    return [];
  }

  if (!data) return [];

  return data.map((item: any) => ({
    ...item,
    author: item.author || null,
    cover: item.cover || null,
    tags: item.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    technologies: item.technologies?.map((t: any) => t.technology).filter(Boolean) || [],
    images: item.images?.map((i: any) => i.media).filter(Boolean) || [],
  }));
}

export async function getProjectByIdAdmin(id: string): Promise<ProjectWithRelations | null> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      author:author_id(*),
      cover:media!cover_image(*),
      tags:project_tags(tag:tag_id(*)),
      technologies:project_technologies(technology:technology_id(*)),
      images:project_images(media:media_id(*))
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    if (error && error.code !== 'PGRST116') {
      console.error('[DB Projects] getProjectByIdAdmin error:', error);
    }
    return null;
  }

  return {
    ...data,
    author: data.author || null,
    cover: data.cover || null,
    tags: data.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    technologies: data.technologies?.map((t: any) => t.technology).filter(Boolean) || [],
    images: data.images?.map((i: any) => i.media).filter(Boolean) || [],
  };
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required to create projects');
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
    .from('projects')
    .insert({
      author_id: user.id,
      title: input.title.trim(),
      slug: formattedSlug,
      short_description: input.short_description || null,
      overview: input.overview || null,
      problem: input.problem || null,
      solution: input.solution || null,
      architecture: input.architecture || null,
      github_url: input.github_url || null,
      live_url: input.live_url || null,
      cover_image: input.cover_image || null,
      status: isPublished ? 'published' : 'draft',
      published: isPublished,
      featured: Boolean(input.featured),
      seo_title: input.seo_title || null,
      seo_description: input.seo_description || null,
      published_at: publishedAt,
    })
    .select()
    .single();

  if (error) {
    console.error('[DB Projects] createProject error:', error);
    throw new Error(`Failed to create project: ${error.message}`);
  }

  // Sync Tags
  if (input.tag_ids && input.tag_ids.length > 0) {
    const tagRows = input.tag_ids.map((tagId) => ({
      project_id: data.id,
      tag_id: tagId,
    }));
    await supabase.from('project_tags').insert(tagRows);
  }

  // Sync Technologies
  if (input.technology_ids && input.technology_ids.length > 0) {
    const techRows = input.technology_ids.map((techId) => ({
      project_id: data.id,
      technology_id: techId,
    }));
    await supabase.from('project_technologies').insert(techRows);
  }

  // Sync Images
  if (input.image_ids && input.image_ids.length > 0) {
    const imageRows = input.image_ids.map((mediaId, idx) => ({
      project_id: data.id,
      media_id: mediaId,
      display_order: idx,
    }));
    await supabase.from('project_images').insert(imageRows);
  }

  return data;
}

export async function updateProject(id: string, input: ProjectInput): Promise<Project> {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required to update projects');
  }

  const isPublished = Boolean(input.published);
  const formattedSlug = input.slug ? slugify(input.slug) : slugify(input.title);
  const publishedAt = isPublished
    ? (input.published_at ? new Date(input.published_at).toISOString() : new Date().toISOString())
    : (input.published_at ? new Date(input.published_at).toISOString() : null);

  const { data, error } = await supabase
    .from('projects')
    .update({
      title: input.title.trim(),
      slug: formattedSlug,
      short_description: input.short_description || null,
      overview: input.overview || null,
      problem: input.problem || null,
      solution: input.solution || null,
      architecture: input.architecture || null,
      github_url: input.github_url || null,
      live_url: input.live_url || null,
      cover_image: input.cover_image || null,
      status: isPublished ? 'published' : 'draft',
      published: isPublished,
      featured: Boolean(input.featured),
      seo_title: input.seo_title || null,
      seo_description: input.seo_description || null,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[DB Projects] updateProject error:', error);
    throw new Error(`Failed to update project: ${error.message}`);
  }

  // Sync Tags
  if (input.tag_ids !== undefined) {
    await supabase.from('project_tags').delete().eq('project_id', id);
    if (input.tag_ids.length > 0) {
      const tagRows = input.tag_ids.map((tagId) => ({
        project_id: id,
        tag_id: tagId,
      }));
      await supabase.from('project_tags').insert(tagRows);
    }
  }

  // Sync Technologies
  if (input.technology_ids !== undefined) {
    await supabase.from('project_technologies').delete().eq('project_id', id);
    if (input.technology_ids.length > 0) {
      const techRows = input.technology_ids.map((techId) => ({
        project_id: id,
        technology_id: techId,
      }));
      await supabase.from('project_technologies').insert(techRows);
    }
  }

  // Sync Images
  if (input.image_ids !== undefined) {
    await supabase.from('project_images').delete().eq('project_id', id);
    if (input.image_ids.length > 0) {
      const imageRows = input.image_ids.map((mediaId, idx) => ({
        project_id: id,
        media_id: mediaId,
        display_order: idx,
      }));
      await supabase.from('project_images').insert(imageRows);
    }
  }

  return data;
}

export async function toggleProjectPublish(id: string, publish: boolean): Promise<Project> {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const { data, error } = await supabase
    .from('projects')
    .update({
      published: publish,
      status: publish ? 'published' : 'draft',
      published_at: publish ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[DB Projects] toggleProjectPublish error:', error);
    throw new Error(`Failed to toggle publish state: ${error.message}`);
  }

  return data;
}

export async function deleteProject(id: string): Promise<boolean> {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required to delete projects');
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[DB Projects] deleteProject error:', error);
    throw new Error(`Failed to delete project: ${error.message}`);
  }

  return true;
}
