import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kzofbstpjdtsaiwddznc.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_qtFUdszaEg921Oc-H8spmA_la_KlyN3'

const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanDemoData() {
  console.log('\n--- Cleaning Junk / Demo Data ---')

  // Delete junk article 'dfsdgfh'
  const { data, error } = await supabase
    .from('articles')
    .delete()
    .eq('slug', 'dfsdgfh')

  if (error) {
    console.log('Note (RLS active): Anonymous delete error:', error.message)
  } else {
    console.log('✅ Junk demo article deleted successfully.')
  }

  const { data: articles } = await supabase.from('articles').select('id, title, slug')
  console.log('Articles remaining:', articles?.length || 0)
}

cleanDemoData()
