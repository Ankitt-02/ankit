import { createServerClient } from '@/lib/supabase/server';
import type { DatabaseStats } from './types';

export async function getDatabaseStats(): Promise<DatabaseStats> {
  const supabase = await createServerClient();

  try {
    const [
      { count: articlesCount },
      { count: publishedArticlesCount },
      { count: draftArticlesCount },
      { count: projectsCount },
      { count: publishedProjectsCount },
      { count: momentsCount },
      { count: publishedMomentsCount },
      { count: mediaCount },
      { count: tagsCount },
      { count: technologiesCount },
    ] = await Promise.all([
      supabase.from('articles').select('*', { count: 'exact', head: true }),
      supabase.from('articles').select('*', { count: 'exact', head: true }).eq('published', true),
      supabase.from('articles').select('*', { count: 'exact', head: true }).eq('published', false),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('published', true),
      supabase.from('moments').select('*', { count: 'exact', head: true }),
      supabase.from('moments').select('*', { count: 'exact', head: true }).eq('published', true),
      supabase.from('media').select('*', { count: 'exact', head: true }),
      supabase.from('tags').select('*', { count: 'exact', head: true }),
      supabase.from('technologies').select('*', { count: 'exact', head: true }),
    ]);

    return {
      totalArticles: articlesCount || 0,
      publishedArticles: publishedArticlesCount || 0,
      draftArticles: draftArticlesCount || 0,
      totalProjects: projectsCount || 0,
      publishedProjects: publishedProjectsCount || 0,
      totalMoments: momentsCount || 0,
      publishedMoments: publishedMomentsCount || 0,
      totalMedia: mediaCount || 0,
      totalTags: tagsCount || 0,
      totalTechnologies: technologiesCount || 0,
    };
  } catch (error) {
    console.error('[DB Statistics] Error fetching statistics:', error);
    return {
      totalArticles: 0,
      publishedArticles: 0,
      draftArticles: 0,
      totalProjects: 0,
      publishedProjects: 0,
      totalMoments: 0,
      publishedMoments: 0,
      totalMedia: 0,
      totalTags: 0,
      totalTechnologies: 0,
    };
  }
}
