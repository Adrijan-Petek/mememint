import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/utils/database/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('address');

    if (!userAddress) {
      return NextResponse.json({ data: null, error: 'User address required' }, { status: 400 });
    }

    // Get user rank
    const result = await sql(`
      SELECT rank FROM (
        SELECT
          u.address,
          ROW_NUMBER() OVER (ORDER BY (COALESCE(SUM(s.points), 0) + (COALESCE(mc.count, 0) * 150)) DESC) as rank
        FROM users u
        LEFT JOIN scores s ON u.address = s.user_address
        LEFT JOIN mint_counts mc ON u.address = mc.user_address
        GROUP BY u.address
      ) ranked_users
      WHERE address = $1
    `, [userAddress.toLowerCase()]);

    // Ensure result is an array and get first row
    const data = Array.isArray(result) ? result[0]?.rank || null : (result.rows && result.rows[0]?.rank) || null;

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error('Error fetching user rank:', error);
    return NextResponse.json({ data: null, error: 'Failed to fetch user rank' }, { status: 500 });
  }
}