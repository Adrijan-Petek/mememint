import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/utils/database/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, fid, username, pfpUrl } = body || {}

    if (!address) {
      return NextResponse.json({ success: false, error: 'address required' }, { status: 400 })
    }

    const normalized = address.toLowerCase()
    const name = username ?? null
    const pfp = pfpUrl ?? null
    const fidVal = typeof fid === 'number' ? fid : (fid ? Number(fid) : null)

    await sql(
      'INSERT INTO users (address, fid, name, pfp, updated_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (address) DO UPDATE SET fid = EXCLUDED.fid, name = EXCLUDED.name, pfp = EXCLUDED.pfp, updated_at = EXCLUDED.updated_at',
      [normalized, fidVal, name, pfp, new Date().toISOString()]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving profile:', error)
    return NextResponse.json({ success: false, error: 'internal_error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ ok: true })
}
