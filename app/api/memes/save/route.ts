import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/utils/database/server'

export async function POST(req: NextRequest) {
  try {
    const { address, imageUrl, title } = await req.json()
    if (!address || !imageUrl) {
      return NextResponse.json({ success: false, error: 'address and imageUrl required' }, { status: 400 })
    }

    // Ensure table exists (safe to run repeatedly)
    await sql(`
      CREATE TABLE IF NOT EXISTS memes (
        id SERIAL PRIMARY KEY,
        user_address TEXT NOT NULL,
        image_url TEXT NOT NULL,
        title TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `)

    await sql('INSERT INTO memes (user_address, image_url, title, created_at) VALUES ($1, $2, $3, $4)', [
      address.toLowerCase(), imageUrl, title ?? null, new Date().toISOString()
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error saving meme:', err)
    return NextResponse.json({ success: false, error: 'internal' }, { status: 500 })
  }
}
