#!/usr/bin/env node

const { Server } = require('@niledatabase/server');
require('dotenv').config({ path: '.env.local' });

async function testDatabase() {
  try {
    console.log('Testing Nile database connection...');

    const nile = new Server({ secureCookies: process.env.VERCEL === "1" });

    // Test basic connection
    const result = await nile.query('SELECT COUNT(*) as count FROM users');
    console.log('✅ Database connection successful. Users count:', result.rows[0].count);

    // Test leaderboard query directly
    console.log('Testing leaderboard query...');
    const leaderboardQuery = `
      SELECT
        u.address as user_address,
        u.fid,
        u.name,
        u.pfp,
        COALESCE(SUM(s.points), 0) + (COALESCE(mc.count, 0) * 150) as total_score,
        ROW_NUMBER() OVER (ORDER BY (COALESCE(SUM(s.points), 0) + (COALESCE(mc.count, 0) * 150)) DESC) as rank,
        GREATEST(
          COALESCE(MAX(s.created_at), '1970-01-01'::timestamp),
          COALESCE(mc.updated_at, '1970-01-01'::timestamp)
        ) as last_activity
      FROM users u
      LEFT JOIN scores s ON u.address = s.user_address
      LEFT JOIN mint_counts mc ON u.address = mc.user_address
      GROUP BY u.address, u.fid, u.name, u.pfp, mc.count, mc.updated_at
      ORDER BY total_score DESC
      LIMIT 5
    `;
    const leaderboard = await nile.query(leaderboardQuery);
    console.log('✅ Leaderboard query working. Sample results:', leaderboard.rows.length);

  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

testDatabase();