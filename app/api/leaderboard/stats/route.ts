import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/utils/database/server';

export async function GET() {
  try {
    // Get leaderboard stats
    const result = await sql(`
      SELECT
        COUNT(DISTINCT u.address) as total_users,
        COALESCE(SUM(s.points), 0) + (COALESCE(SUM(mc.count), 0) * 150) as total_score
      FROM users u
      LEFT JOIN scores s ON u.address = s.user_address
      LEFT JOIN mint_counts mc ON u.address = mc.user_address
    `);

    // Ensure result is an array and get first row
    const data = Array.isArray(result) ? result[0] : (result.rows && result.rows[0]) || null;

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error('Error fetching leaderboard stats:', error);
    return NextResponse.json({ data: null, error: 'Failed to fetch stats' }, { status: 500 });
  }
}