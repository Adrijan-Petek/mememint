#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { sql } = require('./utils/database/client.ts');

async function testLeaderboard() {
  try {
    console.log('Testing leaderboard query...');
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
      LIMIT 5
    `);
    console.log('✅ Leaderboard query successful. Results:', result.length);
    if (result.length > 0) {
      console.log('Sample result:', result[0]);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLeaderboard();