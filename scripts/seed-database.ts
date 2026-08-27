import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const TAGS = [
  { name: 'AI', slug: 'ai', color: '#8b5cf6' },
  { name: 'Machine Learning', slug: 'machine-learning', color: '#ec4899' },
  { name: 'Deep Learning', slug: 'deep-learning', color: '#6366f1' },
  { name: 'LLM', slug: 'llm', color: '#10b981' },
  { name: 'React', slug: 'react', color: '#06b6d4' },
  { name: 'Next.js', slug: 'nextjs', color: '#3b82f6' },
  { name: 'TypeScript', slug: 'typescript', color: '#3b82f6' },
  { name: 'Python', slug: 'python', color: '#f59e0b' },
  { name: 'PostgreSQL', slug: 'postgresql', color: '#3b82f6' },
  { name: 'Supabase', slug: 'supabase', color: '#10b981' },
  { name: 'Open Source', slug: 'open-source', color: '#f43f5e' },
]

const TECHNOLOGIES = [
  { name: 'React', slug: 'react', category: 'Frontend' },
  { name: 'Next.js', slug: 'nextjs', category: 'Frontend' },
  { name: 'Tailwind CSS', slug: 'tailwind-css', category: 'Frontend' },
  { name: 'TypeScript', slug: 'typescript', category: 'Language' },
  { name: 'Node.js', slug: 'nodejs', category: 'Backend' },
  { name: 'Python', slug: 'python', category: 'Language' },
  { name: 'Supabase', slug: 'supabase', category: 'Database' },
  { name: 'PostgreSQL', slug: 'postgresql', category: 'Database' },
  { name: 'Docker', slug: 'docker', category: 'DevOps' },
]

export async function seedMasterData() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('[Seed] Supabase URL or Key missing in environment variables.')
    return false
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('[Seed] Seeding tags...')
  for (const tag of TAGS) {
    await supabase.from('tags').upsert(tag, { onConflict: 'slug' })
  }

  console.log('[Seed] Seeding technologies...')
  for (const tech of TECHNOLOGIES) {
    await supabase.from('technologies').upsert(tech, { onConflict: 'slug' })
  }

  console.log('[Seed] Master data seeding completed successfully.')
  return true
}

if (require.main === module) {
  seedMasterData()
}
