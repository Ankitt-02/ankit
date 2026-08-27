import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { seedMasterData } from '@/scripts/seed-database'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      )
    }

    const success = await seedMasterData()

    if (success) {
      return NextResponse.json({ message: 'Master tags and technologies seeded successfully' })
    } else {
      return NextResponse.json({ error: 'Seeding failed' }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error during seeding' }, { status: 500 })
  }
}
