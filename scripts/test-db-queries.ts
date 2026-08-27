import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kzofbstpjdtsaiwddznc.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_qtFUdszaEg921Oc-H8spmA_la_KlyN3'

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  console.log('--- Testing Profiles ---')
  const { data: prof, error: profErr } = await supabase.from('profiles').select('*').limit(1)
  console.log('Profiles res:', prof, 'Error:', JSON.stringify(profErr, null, 2))

  console.log('--- Testing Projects ---')
  const { data: proj, error: projErr } = await supabase
    .from('projects')
    .select(`
      *,
      author:author_id(*),
      cover:media!cover_image(*),
      tags:project_tags(tag:tag_id(*)),
      technologies:project_technologies(technology:technology_id(*)),
      images:project_images(media:media_id(*))
    `)
    .limit(1)
  console.log('Projects res:', proj, 'Error:', JSON.stringify(projErr, null, 2))

  console.log('--- Testing Articles ---')
  const { data: art, error: artErr } = await supabase
    .from('articles')
    .select(`
      *,
      author:author_id(*),
      cover:media!cover_image(*),
      tags:article_tags(tag:tag_id(*)),
      images:article_images(media:media_id(*))
    `)
    .limit(1)
  console.log('Articles res:', art, 'Error:', JSON.stringify(artErr, null, 2))

  console.log('--- Testing Moments ---')
  const { data: mom, error: momErr } = await supabase
    .from('moments')
    .select(`
      *,
      author:author_id(*),
      tags:moment_tags(tag:tag_id(*)),
      images:moment_images(media:media_id(*))
    `)
    .limit(1)
  console.log('Moments res:', mom, 'Error:', JSON.stringify(momErr, null, 2))

  console.log('--- Testing Technologies ---')
  const { data: tech, error: techErr } = await supabase.from('technologies').select('*').limit(1)
  console.log('Technologies res:', tech, 'Error:', JSON.stringify(techErr, null, 2))
}

run()
