import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/utils/database/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ data: null, error: 'Address parameter is required' }, { status: 400 });
    }

    const result = await sql('SELECT count FROM mint_counts WHERE user_address = $1 LIMIT 1', [address.toLowerCase()]);

    // Ensure result is an array and get first row
    const data = Array.isArray(result) ? result[0]?.count || 0 : (result.rows && result.rows[0]?.count) || 0;

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error('Error fetching user mint count:', error);
    return NextResponse.json({ data: null, error: 'Failed to fetch user mint count' }, { status: 500 });
  }
}