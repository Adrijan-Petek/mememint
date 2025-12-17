import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/utils/database/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('address');

    if (!userAddress) {
      return NextResponse.json({ data: null, error: 'User address required' }, { status: 400 });
    }

    // Get user total points
    const result = await sql(`
      SELECT COALESCE(SUM(s.points), 0) + (COALESCE(MAX(mc.count), 0) * 150) as total_points
      FROM users u
      LEFT JOIN scores s ON u.address = s.user_address
      LEFT JOIN mint_counts mc ON u.address = mc.user_address
      WHERE u.address = $1
      GROUP BY u.address
    `, [userAddress.toLowerCase()]);

    // Ensure result is an array and get first row
    const data = Array.isArray(result) ? result[0]?.total_points || 0 : (result.rows && result.rows[0]?.total_points) || 0;

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error('Error fetching user total points:', error);
    return NextResponse.json({ data: null, error: 'Failed to fetch user total points' }, { status: 500 });
  }
}