import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/utils/database/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    // Get leaderboard data
    const result = await sql(`
      SELECT
        u.address as user_address,
        u.fid,
        u.name,
        u.pfp,
        COALESCE(SUM(s.points), 0) + (COALESCE(mc.count, 0) * 150) as total_score,
        ROW_NUMBER() OVER (ORDER BY (COALESCE(SUM(s.points), 0) + (COALESCE(mc.count, 0) * 150)) DESC) as rank,
        GREATEST(
          COALESCE(MAX(s.created_at), '1970-01-01'::timestamp with time zone),
          COALESCE(mc.updated_at, '1970-01-01'::timestamp with time zone)
        ) as last_activity
      FROM users u
      LEFT JOIN scores s ON u.address = s.user_address
      LEFT JOIN mint_counts mc ON u.address = mc.user_address
      GROUP BY u.address, u.fid, u.name, u.pfp, mc.count, mc.updated_at
      ORDER BY total_score DESC
      LIMIT $1
    `, [limit]);

    // Ensure result is an array
    const data = Array.isArray(result) ? result : result.rows || [];

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ data: null, error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}