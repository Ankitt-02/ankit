import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kzofbstpjdtsaiwddznc.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_qtFUdszaEg921Oc-H8spmA_la_KlyN3'

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectColumns() {
  console.log('--- Articles Columns ---')
  const { data: art, error: artErr } = await supabase.from('articles').select('*').limit(1)
  if (artErr) console.error(artErr)
  else console.log('Articles sample row keys:', art && art[0] ? Object.keys(art[0]) : 'Empty table')

  console.log('\n--- Projects Columns ---')
  const { data: proj, error: projErr } = await supabase.from('projects').select('*').limit(1)
  if (projErr) console.error(projErr)
  else console.log('Projects sample row keys:', proj && proj[0] ? Object.keys(proj[0]) : 'Empty table')

  console.log('\n--- Moments Columns ---')
  const { data: mom, error: momErr } = await supabase.from('moments').select('*').limit(1)
  if (momErr) console.error(momErr)
  else console.log('Moments sample row keys:', mom && mom[0] ? Object.keys(mom[0]) : 'Empty table')
}

inspectColumns()
