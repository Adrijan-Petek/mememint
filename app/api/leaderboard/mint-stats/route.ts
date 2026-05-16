import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/utils/database/server';

export async function GET() {
  try {
    // Get mint stats
    const result = await sql(`
      SELECT
        COALESCE(SUM(count), 0) as total_mints,
        COUNT(DISTINCT user_address) as unique_users
      FROM mint_counts
    `);

    // Ensure result is an array and get first row
    const data = Array.isArray(result) ? result[0] : (result.rows && result.rows[0]) || { total_mints: 0, unique_users: 0 };

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error('Error fetching mint stats:', error);
    return NextResponse.json({ data: null, error: 'Failed to fetch mint stats' }, { status: 500 });
  }
}