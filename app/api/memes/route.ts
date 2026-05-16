import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/utils/database/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const address = searchParams.get('address')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!address) {
      return NextResponse.json({ data: [] })
    }

    // Ensure table exists
    await sql(`
      CREATE TABLE IF NOT EXISTS memes (
        id SERIAL PRIMARY KEY,
        user_address TEXT NOT NULL,
        image_url TEXT NOT NULL,
        title TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `)

    const rows = await sql('SELECT id, user_address, image_url, title, created_at FROM memes WHERE user_address = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [address.toLowerCase(), limit, offset])

    return NextResponse.json({ data: Array.isArray(rows) ? rows : rows.rows || [] })
  } catch (err) {
    console.error('Error fetching memes:', err)
    return NextResponse.json({ data: [] }, { status: 500 })
  }
}