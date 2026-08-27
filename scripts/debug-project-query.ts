import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kzofbstpjdtsaiwddznc.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_qtFUdszaEg921Oc-H8spmA_la_KlyN3'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProjectsQuery() {
  console.log('\n--- Testing Projects Complex Join Query (Fixed Syntax) ---')
  const { data: complexData, error: complexErr } = await supabase
    .from('projects')
    .select(`
      *,
      author:author_id(*),
      cover:media!cover_image(*),
      tags:project_tags(tag:tag_id(*)),
      technologies:project_technologies(technology:technology_id(*)),
      images:project_images(media:media_id(*))
    `)

  if (complexErr) {
    console.error('Complex query error:', JSON.stringify(complexErr, null, 2))
  } else {
    console.log('✅ FIXED COMPLEX QUERY SUCCESS! Data count:', complexData?.length)
  }
}

testProjectsQuery()
