import { NextRequest, NextResponse } from 'next/server';
import { Server } from '@niledatabase/server';
import { sql } from '../../../../utils/database/server';

const nile = new Server({ secureCookies: process.env.VERCEL === "1" });

export async function POST(request: NextRequest) {
  try {
    const { userAddress, dropId, tokenId, amount, txHash } = await request.json();

    if (!userAddress || !dropId || !tokenId || !amount || !txHash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert into nft_mints table
    await nile.query(
      `INSERT INTO nft_mints (user_address, drop_id, token_id, amount, tx_hash) VALUES ($1, $2, $3, $4, $5)`,
      [userAddress, dropId, tokenId, amount, txHash]
    );

    // Safely increment drops.minted but do not exceed supply
    try {
      const rows = await sql(
        `UPDATE drops SET minted = LEAST(COALESCE(minted,0) + $1, COALESCE(supply, 0)) WHERE drop_id = $2 RETURNING minted`,
        [amount, dropId]
      );
      // sql helper returns an array of rows
      const updatedMinted = Array.isArray(rows) && rows[0] ? rows[0].minted : null;

      // Award points for minting NFT
      const points = amount * 10; // 10 points per NFT minted
      await nile.query(
        `INSERT INTO scores (user_address, action, points) VALUES ($1, $2, $3)`,
        [userAddress, 'mint_nft', points]
      );

      return NextResponse.json({ success: true, updatedMinted });
    } catch (e) {
      console.error('Error updating drops.minted:', e);
    }
    // Fallback: if update failed above, still award points
    const points = amount * 10;
    await nile.query(`INSERT INTO scores (user_address, action, points) VALUES ($1, $2, $3)`, [userAddress, 'mint_nft', points]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording mint:', error);
    return NextResponse.json({ error: 'Failed to record mint' }, { status: 500 });
  }
}