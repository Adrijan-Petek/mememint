import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/utils/database/server';

// Define valid actions
type ScoringAction = 'generate' | 'game' | 'buy_token' | 'hold_token';

const SCORING_CONFIG = {
  generate: 150,
  game: 200,
  buy_token: 50,
  hold_token: 1000
} as const;

export async function POST(request: NextRequest) {
  try {
    const { action, userAddress } = await request.json();

    if (!action || !userAddress) {
      return NextResponse.json({ success: false, error: 'Action and userAddress required' }, { status: 400 });
    }

    // Validate action type
    if (!Object.keys(SCORING_CONFIG).includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    const points = SCORING_CONFIG[action as ScoringAction];

    // Ensure user exists
    await sql('INSERT INTO users (address) VALUES ($1) ON CONFLICT (address) DO NOTHING', [userAddress.toLowerCase()]);

    // Add score entry
    const result = await sql('INSERT INTO scores (user_address, action, points) VALUES ($1, $2, $3) RETURNING *',
      [userAddress.toLowerCase(), action, points]);

    // Ensure result is an array and get first row
    const data = Array.isArray(result) ? result[0] : (result.rows && result.rows[0]) || null;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error adding score:', error);
    return NextResponse.json({ success: false, error: 'Failed to add score' }, { status: 500 });
  }
}