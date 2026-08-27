import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kzofbstpjdtsaiwddznc.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_qtFUdszaEg921Oc-H8spmA_la_KlyN3'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFK() {
  console.log('Testing simple select without cover_image join:')
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      author:author_id(*),
      tags:project_tags(tag:tag_id(*)),
      technologies:project_technologies(technology:technology_id(*)),
      images:project_images(media:media_id(*))
    `)

  if (error) {
    console.error('Error without cover join:', error)
  } else {
    console.log('✅ Success without cover join! Count:', data?.length)
  }
}

testFK()
