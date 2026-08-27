import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kzofbstpjdtsaiwddznc.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_qtFUdszaEg921Oc-H8spmA_la_KlyN3'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAll() {
  console.log('\n--- 1. Testing Articles Select ---')
  const { data: art, error: artErr } = await supabase
    .from('articles')
    .select(`
      *,
      author:author_id(*),
      cover:media!cover_image(*),
      tags:article_tags(tag:tag_id(*)),
      images:article_images(media:media_id(*))
    `)
  console.log('Articles status:', artErr ? 'ERROR: ' + JSON.stringify(artErr) : 'OK, count: ' + art?.length)

  console.log('\n--- 2. Testing Projects Select ---')
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
  console.log('Projects status:', projErr ? 'ERROR: ' + JSON.stringify(projErr) : 'OK, count: ' + proj?.length)

  console.log('\n--- 3. Testing Moments Select ---')
  const { data: mom, error: momErr } = await supabase
    .from('moments')
    .select(`
      *,
      author:author_id(*),
      tags:moment_tags(tag:tag_id(*)),
      images:moment_images(media:media_id(*))
    `)
  console.log('Moments status:', momErr ? 'ERROR: ' + JSON.stringify(momErr) : 'OK, count: ' + mom?.length)

  if (artErr || projErr || momErr) {
    console.error('\n❌ One or more public queries failed!')
    process.exit(1)
  } else {
    console.log('\n🎉 ALL PUBLIC QUERY JOINS PASSED WITH 0 ERRORS!')
    process.exit(0)
  }
}

testAll()
