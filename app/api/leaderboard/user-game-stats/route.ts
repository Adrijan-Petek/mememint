import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/utils/database/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('address');

    if (!userAddress) {
      return NextResponse.json({ data: null, error: 'User address required' }, { status: 400 });
    }

    const result = await sql(
      `
      SELECT
        COALESCE(MAX(points), 0) as high_score,
        COALESCE((
          SELECT points
          FROM scores
          WHERE user_address = $1 AND action = 'game'
          ORDER BY created_at DESC
          LIMIT 1
        ), 0) as last_score,
        COALESCE(COUNT(*), 0) as games_played
      FROM scores
      WHERE user_address = $1 AND action = 'game'
      `,
      [userAddress.toLowerCase()]
    );

    const row = Array.isArray(result)
      ? result[0]
      : (result.rows && result.rows[0]) || { high_score: 0, last_score: 0, games_played: 0 };

    return NextResponse.json({ data: row, error: null });
  } catch (error) {
    console.error('Error fetching user game stats:', error);
    return NextResponse.json({ data: null, error: 'Failed to fetch user game stats' }, { status: 500 });
  }
}
