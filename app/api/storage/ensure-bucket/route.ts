import 'server-only'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const bucket = (body?.bucket as string) || 'attachments'

    const supabase = createServerClient()

    // Check if bucket exists
    const { data: existing, error: getError } = await supabase.storage.getBucket(bucket)

    if (getError && !/not found/i.test(getError.message)) {
      return NextResponse.json({ ok: false, error: getError.message }, { status: 500 })
    }

    if (!existing) {
      const { error: createError } = await supabase.storage.createBucket(bucket, {
        public: true,
      })

      if (createError) {
        // If it already exists due to race condition, proceed
        if (!/already exists/i.test(createError.message)) {
          return NextResponse.json({ ok: false, error: createError.message }, { status: 500 })
        }
      }

      return NextResponse.json({ ok: true, created: true })
    }

    return NextResponse.json({ ok: true, created: false })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Unknown error' }, { status: 500 })
  }
}

