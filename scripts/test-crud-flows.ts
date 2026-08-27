import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kzofbstpjdtsaiwddznc.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_qtFUdszaEg921Oc-H8spmA_la_KlyN3'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCrud() {
  console.log('\n=== Testing Master Data Seeding & Public Read CRUD ===')

  // Read tags
  const { data: tags, error: tagsErr } = await supabase.from('tags').select('*')
  console.log(`[Tags Read] Status: ${tagsErr ? 'ERROR: ' + tagsErr.message : 'OK'}, Count: ${tags?.length || 0}`)

  // Read technologies
  const { data: techs, error: techsErr } = await supabase.from('technologies').select('*')
  console.log(`[Technologies Read] Status: ${techsErr ? 'ERROR: ' + techsErr.message : 'OK'}, Count: ${techs?.length || 0}`)

  // Read published articles
  const { data: articles, error: artErr } = await supabase.from('articles').select('*').eq('published', true)
  console.log(`[Articles Read] Status: ${artErr ? 'ERROR: ' + artErr.message : 'OK'}, Published Count: ${articles?.length || 0}`)

  // Read published projects
  const { data: projects, error: projErr } = await supabase.from('projects').select('*').eq('published', true)
  console.log(`[Projects Read] Status: ${projErr ? 'ERROR: ' + projErr.message : 'OK'}, Published Count: ${projects?.length || 0}`)

  // Read published moments
  const { data: moments, error: momErr } = await supabase.from('moments').select('*').eq('published', true)
  console.log(`[Moments Read] Status: ${momErr ? 'ERROR: ' + momErr.message : 'OK'}, Published Count: ${moments?.length || 0}`)

  // Read profile
  const { data: profiles, error: profErr } = await supabase.from('profiles').select('*').limit(1)
  console.log(`[Profiles Read] Status: ${profErr ? 'ERROR: ' + profErr.message : 'OK'}, Count: ${profiles?.length || 0}`)

  if (tagsErr || techsErr || artErr || projErr || momErr || profErr) {
    console.error('\n❌ CRUD Read tests failed.')
    process.exit(1)
  } else {
    console.log('\n✅ ALL PUBLIC READ & SCHEMA QUERY TESTS PASSED!')
    process.exit(0)
  }
}

testCrud()
