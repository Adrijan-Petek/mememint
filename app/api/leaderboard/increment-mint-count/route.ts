import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/utils/database/server';

export async function POST(request: NextRequest) {
  try {
    const { userAddress } = await request.json();

    if (!userAddress) {
      return NextResponse.json({ data: null, error: 'User address required' }, { status: 400 });
    }

    // Insert or update mint count
    await sql(`
      INSERT INTO mint_counts (user_address, count, updated_at)
      VALUES ($1, 1, NOW())
      ON CONFLICT (user_address)
      DO UPDATE SET
        count = mint_counts.count + 1,
        updated_at = NOW()
    `, [userAddress.toLowerCase()]);

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (error) {
    console.error('Error incrementing mint count:', error);
    return NextResponse.json({ data: null, error: 'Failed to increment mint count' }, { status: 500 });
  }
}