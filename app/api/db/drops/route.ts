import { NextRequest, NextResponse } from 'next/server';
import { Server } from '@niledatabase/server';

const nile = new Server({ secureCookies: process.env.VERCEL === "1" });

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
    const { dropId, name, description, priceWei, supply, uri, txHash } = await request.json();

    if (!dropId || !name || !description || !priceWei || !supply || !uri) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert into drops table
    await nile.query(
      `INSERT INTO drops (drop_id, name, description, price_wei, supply, minted, uri, tx_hash) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [dropId, name, description, priceWei, supply, 0, uri, txHash || null]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving drop to DB:', error);
    return NextResponse.json({ error: 'Failed to save drop' }, { status: 500 });
  }
}