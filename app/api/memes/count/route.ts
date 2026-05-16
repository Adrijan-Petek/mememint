import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/utils/database/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json({ data: 0 })
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

    const result = await sql('SELECT COUNT(*) as count FROM memes WHERE user_address = $1', [address.toLowerCase()])

    const count = Array.isArray(result) ? result[0]?.count || 0 : result.rows?.[0]?.count || 0

    return NextResponse.json({ data: parseInt(count) || 0 })
  } catch (err) {
    console.error('Error fetching memes count:', err)
    return NextResponse.json({ data: 0 }, { status: 500 })
  }
}