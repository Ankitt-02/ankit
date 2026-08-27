// Comprehensive database types for Personal Developer Portfolio & Admin CMS

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  role: 'admin' | 'user' | null;
  bio: string | null;
  headline: string | null;
  avatar_url: string | null;
  resume_url: string | null;
  education: string | null;
  detailed_bio: string | null;
  engineering_interests: string | null;
  personal_interests: string | null;
  website: string | null;
  github: string | null;
  linkedin: string | null;
  instagram: string | null;
  twitter: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileInput {
  name?: string | null;
  email?: string | null;
  role?: 'admin' | 'user' | null;
  bio?: string | null;
  headline?: string | null;
  avatar_url?: string | null;
  resume_url?: string | null;
  education?: string | null;
  detailed_bio?: string | null;
  engineering_interests?: string | null;
  personal_interests?: string | null;
  website?: string | null;
  github?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  twitter?: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  created_at: string;
}

export interface TagInput {
  name: string;
  slug: string;
  color?: string | null;
}

export interface Technology {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  created_at: string;
}

export interface TechnologyInput {
  name: string;
  slug: string;
  category?: string | null;
  icon_url?: string | null;
}

export interface Media {
  id: string;
  filename: string;
  storage_path: string;
  public_url: string;
  alt_text: string | null;
  width: number | null;
  height: number | null;
  mime_type: string | null;
  size: number | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface Article {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  reading_time: number | null;
  status: 'draft' | 'published' | 'archived';
  published: boolean;
  featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleInput {
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  cover_image?: string | null;
  featured?: boolean;
  published?: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  published_at?: string | null;
  tag_ids?: string[];
  image_ids?: string[];
}

export interface ArticleWithAuthor extends Article {
  author: Profile | null;
}

export interface ArticleWithRelations extends ArticleWithAuthor {
  cover: Media | null;
  tags: Tag[];
  images: Media[];
}

export interface Project {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  short_description: string | null;
  overview: string | null;
  problem: string | null;
  solution: string | null;
  architecture: string | null;
  github_url: string | null;
  live_url: string | null;
  cover_image: string | null;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectInput {
  title: string;
  slug: string;
  short_description?: string | null;
  overview?: string | null;
  problem?: string | null;
  solution?: string | null;
  architecture?: string | null;
  github_url?: string | null;
  live_url?: string | null;
  cover_image?: string | null;
  featured?: boolean;
  published?: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  published_at?: string | null;
  tag_ids?: string[];
  technology_ids?: string[];
  image_ids?: string[];
}

export interface ProjectWithAuthor extends Project {
  author: Profile | null;
}

export interface ProjectWithRelations extends ProjectWithAuthor {
  cover: Media | null;
  tags: Tag[];
  technologies: Technology[];
  images: Media[];
}

export interface Moment {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  content: string | null;
  location: string | null;
  mood: string | null;
  event_date: string | null;
  featured: boolean;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MomentInput {
  title: string;
  slug: string;
  content?: string | null;
  location?: string | null;
  mood?: string | null;
  event_date?: string | null;
  featured?: boolean;
  published?: boolean;
  published_at?: string | null;
  tag_ids?: string[];
  image_ids?: string[];
}

export interface MomentWithAuthor extends Moment {
  author: Profile | null;
}

export interface MomentWithRelations extends MomentWithAuthor {
  tags: Tag[];
  images: Media[];
}

export interface DatabaseStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalProjects: number;
  publishedProjects: number;
  totalMoments: number;
  publishedMoments: number;
  totalMedia: number;
  totalTags: number;
  totalTechnologies: number;
}
