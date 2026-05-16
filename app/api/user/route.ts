import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/utils/database/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json({ error: 'address required' }, { status: 400 })
    }

    const rows = await sql('SELECT address, fid, name, pfp, updated_at FROM users WHERE address = $1 LIMIT 1', [address.toLowerCase()])
    const user = Array.isArray(rows) ? rows[0] : (rows && rows[0]) || null

    if (!user) {
      return NextResponse.json({ data: null })
    }

    return NextResponse.json({ data: {
      address: user.address,
      fid: user.fid,
      username: user.name,
      pfp: user.pfp,
      updated_at: user.updated_at
    }})
  } catch (error) {
    console.error('Error fetching user from DB:', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
