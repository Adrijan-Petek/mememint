import { NextRequest, NextResponse } from 'next/server';
import { Server } from '@niledatabase/server';

const nile = new Server({ secureCookies: process.env.VERCEL === "1" });

export async function GET() {
  try {
    const result = await nile.query('SELECT * FROM drops ORDER BY drop_id DESC');
    return NextResponse.json({ drops: result.rows });
  } catch (error) {
    console.error('Error fetching drops:', error);
    return NextResponse.json({ error: 'Failed to fetch drops' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { dropId, name, description, priceWei, supply, uri } = await request.json();

    if (!dropId || !name || !description || !priceWei || !supply || !uri) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert into drops table
    await nile.query(
      `INSERT INTO drops (drop_id, name, description, price_wei, supply, minted, uri) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [dropId, name, description, priceWei, supply, 0, uri]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving drop to DB:', error);
    return NextResponse.json({ error: 'Failed to save drop' }, { status: 500 });
  }
}