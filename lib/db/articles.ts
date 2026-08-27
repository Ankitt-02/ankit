import { createServerClient } from '@/lib/supabase/server';
import type { Article, ArticleInput, ArticleWithRelations } from './types';
import { slugify } from '@/lib/utils';

export function calculateReadingTime(text: string | null): number {
  if (!text) return 1;
  const wordsPerMinute = 200;
  const noHtml = text.replace(/<[^>]*>?/gm, '');
  const words = noHtml.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export async function getPublishedArticles(limit: number = 10, offset: number = 0): Promise<ArticleWithRelations[]> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const supabase = await createServerClient();
      
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          author:author_id(*),
          cover:media!cover_image(*),
          tags:article_tags(tag:tag_id(*)),
          images:article_images(media:media_id(*))
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
          images: item.images?.map((i: any) => i.media).filter(Boolean) || [],
        }));
      }
    } catch (err) {
      if (attempt === 1) console.error('[DB Articles] getPublishedArticles catch:', err);
    }
  }
  return [];
}

export async function getFeaturedArticles(limit: number = 3): Promise<ArticleWithRelations[]> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const supabase = await createServerClient();
      
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          author:author_id(*),
          cover:media!cover_image(*),
          tags:article_tags(tag:tag_id(*)),
          images:article_images(media:media_id(*))
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
          images: item.images?.map((i: any) => i.media).filter(Boolean) || [],
        }));
      }
    } catch (err) {
      if (attempt === 1) console.error('[DB Articles] getFeaturedArticles catch:', err);
    }
  }
  return [];
}

export async function getArticleBySlug(slug: string): Promise<ArticleWithRelations | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const supabase = await createServerClient();
      
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          author:author_id(*),
          cover:media!cover_image(*),
          tags:article_tags(tag:tag_id(*)),
          images:article_images(media:media_id(*))
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
          images: data.images?.map((i: any) => i.media).filter(Boolean) || [],
        };
      }
    } catch (err) {
      if (attempt === 1) console.error('[DB Articles] getArticleBySlug catch:', err);
    }
  }
  return null;
}

export async function getAllArticlesAdmin(): Promise<ArticleWithRelations[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      author:author_id(*),
      cover:media!cover_image(*),
      tags:article_tags(tag:tag_id(*)),
      images:article_images(media:media_id(*))
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[DB Articles] getAllArticlesAdmin error:', error);
    return [];
  }

  if (!data) return [];

  return data.map((item: any) => ({
    ...item,
    author: item.author || null,
    cover: item.cover || null,
    tags: item.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    images: item.images?.map((i: any) => i.media).filter(Boolean) || [],
  }));
}

export async function getArticleByIdAdmin(id: string): Promise<ArticleWithRelations | null> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      author:author_id(*),
      cover:media!cover_image(*),
      tags:article_tags(tag:tag_id(*)),
      images:article_images(media:media_id(*))
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    if (error && error.code !== 'PGRST116') {
      console.error('[DB Articles] getArticleByIdAdmin error:', error);
    }
    return null;
  }

  return {
    ...data,
    author: data.author || null,
    cover: data.cover || null,
    tags: data.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    images: data.images?.map((i: any) => i.media).filter(Boolean) || [],
  };
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required to create articles');
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
  const readTime = calculateReadingTime(input.content || '');
  const publishedAt = isPublished 
    ? (input.published_at ? new Date(input.published_at).toISOString() : new Date().toISOString())
    : (input.published_at ? new Date(input.published_at).toISOString() : null);

  const { data, error } = await supabase
    .from('articles')
    .insert({
      author_id: user.id,
      title: input.title.trim(),
      slug: formattedSlug,
      excerpt: input.excerpt || null,
      content: input.content || null,
      cover_image: input.cover_image || null,
      reading_time: readTime,
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
    console.error('[DB Articles] createArticle error:', error);
    throw new Error(`Failed to create article: ${error.message}`);
  }

  // Sync Tags
  if (input.tag_ids && input.tag_ids.length > 0) {
    const tagRows = input.tag_ids.map((tagId) => ({
      article_id: data.id,
      tag_id: tagId,
    }));
    await supabase.from('article_tags').insert(tagRows);
  }

  // Sync Images
  if (input.image_ids && input.image_ids.length > 0) {
    const imageRows = input.image_ids.map((mediaId, idx) => ({
      article_id: data.id,
      media_id: mediaId,
      display_order: idx,
    }));
    await supabase.from('article_images').insert(imageRows);
  }

  return data;
}

export async function updateArticle(id: string, input: ArticleInput): Promise<Article> {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required to update articles');
  }

  const isPublished = Boolean(input.published);
  const formattedSlug = input.slug ? slugify(input.slug) : slugify(input.title);
  const readTime = calculateReadingTime(input.content || '');
  const publishedAt = isPublished
    ? (input.published_at ? new Date(input.published_at).toISOString() : new Date().toISOString())
    : (input.published_at ? new Date(input.published_at).toISOString() : null);

  const { data, error } = await supabase
    .from('articles')
    .update({
      title: input.title.trim(),
      slug: formattedSlug,
      excerpt: input.excerpt || null,
      content: input.content || null,
      cover_image: input.cover_image || null,
      reading_time: readTime,
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
    console.error('[DB Articles] updateArticle error:', error);
    throw new Error(`Failed to update article: ${error.message}`);
  }

  // Sync Tags
  if (input.tag_ids !== undefined) {
    await supabase.from('article_tags').delete().eq('article_id', id);
    if (input.tag_ids.length > 0) {
      const tagRows = input.tag_ids.map((tagId) => ({
        article_id: id,
        tag_id: tagId,
      }));
      await supabase.from('article_tags').insert(tagRows);
    }
  }

  // Sync Images
  if (input.image_ids !== undefined) {
    await supabase.from('article_images').delete().eq('article_id', id);
    if (input.image_ids.length > 0) {
      const imageRows = input.image_ids.map((mediaId, idx) => ({
        article_id: id,
        media_id: mediaId,
        display_order: idx,
      }));
      await supabase.from('article_images').insert(imageRows);
    }
  }

  return data;
}

export async function toggleArticlePublish(id: string, publish: boolean): Promise<Article> {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const { data, error } = await supabase
    .from('articles')
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
    console.error('[DB Articles] toggleArticlePublish error:', error);
    throw new Error(`Failed to toggle publish state: ${error.message}`);
  }

  return data;
}

export async function deleteArticle(id: string): Promise<boolean> {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required to delete articles');
  }

  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[DB Articles] deleteArticle error:', error);
    throw new Error(`Failed to delete article: ${error.message}`);
  }

  return true;
}
