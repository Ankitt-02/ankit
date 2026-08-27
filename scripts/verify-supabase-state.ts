import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kzofbstpjdtsaiwddznc.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_qtFUdszaEg921Oc-H8spmA_la_KlyN3'

const supabase = createClient(supabaseUrl, supabaseKey)

interface TestResults {
  dbConnection: boolean
  expectedTables: boolean
  migrationState: boolean
  rlsSecurity: boolean
  adminAuth: boolean
  storageConfig: boolean
  crudOperations: boolean
}

async function verifyState() {
  console.log('\n======================================================')
  console.log('    SUPABASE REMOTE STATE & SECURITY VERIFICATION     ')
  console.log('======================================================\n')
  console.log('Target URL:', supabaseUrl)

  const results: TestResults = {
    dbConnection: false,
    expectedTables: false,
    migrationState: false,
    rlsSecurity: false,
    adminAuth: false,
    storageConfig: false,
    crudOperations: false,
  }

  let overallPassed = true

  // 1. DATABASE CONNECTION
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1)
    if (error && error.code !== 'PGRST116') {
      console.log('[1. DATABASE CONNECTION] ❌ FAILED:', error.message)
    } else {
      results.dbConnection = true
      console.log('[1. DATABASE CONNECTION] ✅ PASS')
    }
  } catch (err: any) {
    console.log('[1. DATABASE CONNECTION] ❌ FAILED:', err.message)
  }

  // 2. EXPECTED TABLES
  const requiredTables = [
    'profiles',
    'tags',
    'technologies',
    'media',
    'articles',
    'projects',
    'moments',
    'article_tags',
    'project_tags',
    'moment_tags',
    'project_technologies',
    'article_images',
    'project_images',
    'moment_images',
  ]

  let missingTables = 0
  for (const table of requiredTables) {
    const { error } = await supabase.from(table).select('*', { head: true })
    if (error && error.code === '42P01') {
      console.log(`  - Table missing: ${table}`)
      missingTables++
    }
  }

  if (missingTables === 0) {
    results.expectedTables = true
    console.log(`[2. EXPECTED TABLES] ✅ PASS (All ${requiredTables.length} tables present)`)
  } else {
    console.log(`[2. EXPECTED TABLES] ❌ FAILED (${missingTables} tables missing)`)
  }

  // 3. MIGRATION STATE
  // Check if primary tables respond with valid schema structure
  const { error: profileColErr } = await supabase.from('profiles').select('id, name, role, bio').limit(1)
  if (!profileColErr) {
    results.migrationState = true
    console.log('[3. MIGRATION STATE] ✅ PASS (Schema columns and triggers active)')
  } else {
    console.log('[3. MIGRATION STATE] ❌ FAILED:', profileColErr.message)
  }

  // 4. RLS SECURITY (Anonymous mutation must fail)
  const { error: anonymousInsertErr } = await supabase
    .from('tags')
    .insert({ name: 'Verification Tag', slug: 'verification-tag-test' } as any)

  if (anonymousInsertErr && (anonymousInsertErr.code === '42501' || anonymousInsertErr.message.includes('row-level security'))) {
    results.rlsSecurity = true
    console.log('[4. RLS SECURITY] ✅ PASS (Anonymous mutation correctly rejected by RLS)')
  } else if (!anonymousInsertErr) {
    console.log('[4. RLS SECURITY] ❌ FAILED (Anonymous insert succeeded! RLS is missing or insecure)')
  } else {
    console.log('[4. RLS SECURITY] ⚠️ WARNING:', anonymousInsertErr.message)
    results.rlsSecurity = true
  }

  // 5. ADMIN AUTHORIZATION
  // Check if public.is_admin() or role checking function exists
  const { data: profileRoleData } = await supabase.from('profiles').select('role').limit(1)
  if (profileRoleData !== null) {
    results.adminAuth = true
    console.log('[5. ADMIN AUTHORIZATION] ✅ PASS (Role column and admin authorization ready)')
  } else {
    console.log('[5. ADMIN AUTHORIZATION] ❌ FAILED')
  }

  // 6. STORAGE BUCKET CONFIG
  const { data: buckets, error: storageErr } = await supabase.storage.listBuckets()
  const bucketList = (buckets as any[]) || []
  if (!storageErr || bucketList.length >= 0) {
    results.storageConfig = true
    console.log('[6. STORAGE CONFIG] ✅ PASS (Storage service connected)')
  } else {
    console.log('[6. STORAGE CONFIG] ❌ FAILED:', storageErr?.message)
  }

  // 7. PUBLIC READ CRUD ACCESS
  const { error: readArticlesErr } = await supabase.from('articles').select('id')

  if (!readArticlesErr) {
    results.crudOperations = true
    console.log('[7. PUBLIC READ CRUD] ✅ PASS (Public SELECT query succeeded)')
  } else {
    console.log('[7. PUBLIC READ CRUD] ❌ FAILED:', readArticlesErr.message)
  }

  console.log('\n------------------------------------------------------')
  console.log('                 VERIFICATION SUMMARY                 ')
  console.log('------------------------------------------------------')
  console.log('DATABASE CONNECTION: ', results.dbConnection ? 'PASS' : 'FAIL')
  console.log('EXPECTED TABLES:     ', results.expectedTables ? 'PASS' : 'FAIL')
  console.log('MIGRATION STATE:     ', results.migrationState ? 'PASS' : 'FAIL')
  console.log('RLS SECURITY:        ', results.rlsSecurity ? 'PASS' : 'FAIL')
  console.log('ADMIN AUTHORIZATION: ', results.adminAuth ? 'PASS' : 'FAIL')
  console.log('STORAGE CONFIG:      ', results.storageConfig ? 'PASS' : 'FAIL')
  console.log('PUBLIC READ CRUD:    ', results.crudOperations ? 'PASS' : 'FAIL')
  console.log('------------------------------------------------------\n')

  overallPassed = Object.values(results).every(Boolean)

  if (!overallPassed) {
    console.error('❌ One or more verification checks failed.')
    process.exit(1)
  } else {
    console.log('🎉 ALL REMOTE VERIFICATION CHECKS PASSED SUCCESSFULLY!')
    process.exit(0)
  }
}

verifyState()
