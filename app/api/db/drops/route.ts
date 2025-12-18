import { NextRequest, NextResponse } from 'next/server';
import { Server } from '@niledatabase/server';

const nile = new Server({ secureCookies: process.env.VERCEL === "1" });

export async function GET() {
  try {
    console.log('Ensuring drops table exists...');
    await nile.query(`
      CREATE TABLE IF NOT EXISTS drops (
        id SERIAL PRIMARY KEY,
        drop_id INTEGER UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price_wei TEXT NOT NULL,
        supply INTEGER NOT NULL,
        minted INTEGER DEFAULT 0 NOT NULL,
        uri TEXT NOT NULL,
        tx_hash TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('Fetching drops from database...');
    const result = await nile.query('SELECT * FROM drops ORDER BY drop_id DESC');
    console.log('Drops fetched:', result?.rows?.length || 0, 'items');
    return NextResponse.json({ drops: result.rows || [] });
  } catch (error) {
    console.error('Error fetching drops:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to fetch drops', details: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { dropId, priceWei } = await request.json();

    if (!dropId || !priceWei) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update drop price
    await nile.query(
      'UPDATE drops SET price_wei = $1 WHERE drop_id = $2',
      [priceWei, dropId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating drop price:', error);
    return NextResponse.json({ error: 'Failed to update drop price' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received drop data:', body);
    
    const { dropId, name, description, priceWei, supply, uri, txHash } = body;

    if (!dropId || !name || !description || !priceWei || !supply || !uri) {
      console.log('Missing required fields:', { dropId, name, description, priceWei, supply, uri });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('Ensuring drops table exists before insert...');
    await nile.query(`
      CREATE TABLE IF NOT EXISTS drops (
        id SERIAL PRIMARY KEY,
        drop_id INTEGER UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price_wei TEXT NOT NULL,
        supply INTEGER NOT NULL,
        minted INTEGER DEFAULT 0 NOT NULL,
        uri TEXT NOT NULL,
        tx_hash TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('Inserting drop with values:', { dropId, name, description, priceWei, supply, uri, txHash });
    const result = await nile.query(
      `INSERT INTO drops (drop_id, name, description, price_wei, supply, minted, uri, tx_hash) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [dropId, name, description, priceWei, supply, 0, uri, txHash || null]
    );
    console.log('Insert result:', result);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving drop to DB:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorCode = error instanceof Error && 'code' in error ? (error as any).code : undefined;

    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      code: errorCode
    });
    return NextResponse.json({ error: 'Failed to save drop', details: errorMessage }, { status: 500 });
  }
}