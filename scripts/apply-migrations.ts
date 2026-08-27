import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('[Migration Script] SUPABASE_SERVICE_ROLE_KEY is not set.')
  console.log('[Migration Script] Please run the SQL files in the Supabase SQL Editor if service role key is unavailable.')
}

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

async function applyMigrations() {
  if (!supabase) {
    console.error('[Migration Script] Cannot run migrations automatically without SUPABASE_SERVICE_ROLE_KEY.')
    console.error('[Migration Script] Please copy the SQL from supabase/migrations/ and paste it into your Supabase Dashboard SQL Editor.')
    return
  }

  try {
    console.log('[Migration Script] Reading migration files from filesystem...')
    const migration001Path = path.join(process.cwd(), 'supabase', 'migrations', '001_init_schema.sql')
    const migration002Path = path.join(process.cwd(), 'supabase', 'migrations', '002_rls_policies.sql')

    const migration001 = fs.readFileSync(migration001Path, 'utf8')
    const migration002 = fs.readFileSync(migration002Path, 'utf8')

    console.log('[Migration Script] Executing migration 001_init_schema.sql...')
    const { error: error1 } = await supabase.rpc('exec', { sql: migration001 })
    if (error1) {
      console.warn('[Migration Script] rpc exec returned error for 001:', error1.message)
    } else {
      console.log('[Migration Script] 001_init_schema.sql executed successfully!')
    }

    console.log('[Migration Script] Executing migration 002_rls_policies.sql...')
    const { error: error2 } = await supabase.rpc('exec', { sql: migration002 })
    if (error2) {
      console.warn('[Migration Script] rpc exec returned error for 002:', error2.message)
    } else {
      console.log('[Migration Script] 002_rls_policies.sql executed successfully!')
    }

    console.log('[Migration Script] Finished applying migrations.')
  } catch (err) {
    console.error('[Migration Script] Exception during migration execution:', err)
  }
}

applyMigrations()
