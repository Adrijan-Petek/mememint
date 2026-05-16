#!/usr/bin/env node

/**
 * Neon Database Setup Script
 *
 * This script helps you set up your Neon PostgreSQL database with the required tables and functions.
 *
 * To use this script:
 * 1. Make sure you have your DATABASE_URL set in .env.local
 * 2. Run this script: node setup-neon.cjs
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

console.log('🚀 Setting up Neon PostgreSQL database...\n');

async function setupDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.log('❌ DATABASE_URL not found in .env.local');
    console.log('Please make sure your Neon database URL is set in .env.local');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  try {
    console.log('📋 Creating tables...');

    // Create users table
    await sql`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      address TEXT UNIQUE NOT NULL,
      fid INTEGER UNIQUE,
      name TEXT,
      pfp TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`;
    console.log('✅ Created users table');

    // Create scores table
    await sql`CREATE TABLE IF NOT EXISTS scores (
      id SERIAL PRIMARY KEY,
      user_address TEXT NOT NULL REFERENCES users(address) ON DELETE CASCADE,
      action TEXT NOT NULL CHECK (action IN ('generate', 'game', 'buy_token', 'hold_token')),
      points INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`;
    console.log('✅ Created scores table');

    // Create mint_counts table
    await sql`CREATE TABLE IF NOT EXISTS mint_counts (
      id SERIAL PRIMARY KEY,
      user_address TEXT UNIQUE NOT NULL REFERENCES users(address) ON DELETE CASCADE,
      count INTEGER DEFAULT 0 NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`;
    console.log('✅ Created mint_counts table');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_scores_user_address ON scores(user_address)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_mint_counts_user_address ON mint_counts(user_address)`;
    console.log('✅ Created indexes');

    // Create functions
    console.log('📋 Creating functions...');

    // get_leaderboard function
    await sql`
      CREATE OR REPLACE FUNCTION get_leaderboard(limit_param INTEGER DEFAULT 100)
      RETURNS TABLE (
        user_address TEXT,
        fid INTEGER,
        name TEXT,
        pfp TEXT,
        total_score BIGINT,
        rank BIGINT,
        last_activity TIMESTAMP WITH TIME ZONE
      )
      LANGUAGE SQL
      AS $$
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
        LIMIT limit_param;
      $$
    `;
    console.log('✅ Created get_leaderboard function');

    // get_leaderboard_stats function
    await sql`
      CREATE OR REPLACE FUNCTION get_leaderboard_stats()
      RETURNS TABLE (total_users BIGINT, total_score BIGINT)
      LANGUAGE SQL
      AS $$
        SELECT
          COUNT(DISTINCT u.address) as total_users,
          COALESCE(SUM(s.points), 0) + (COALESCE(SUM(mc.count), 0) * 150) as total_score
        FROM users u
        LEFT JOIN scores s ON u.address = s.user_address
        LEFT JOIN mint_counts mc ON u.address = mc.user_address;
      $$
    `;
    console.log('✅ Created get_leaderboard_stats function');

    // get_user_rank function
    await sql`
      CREATE OR REPLACE FUNCTION get_user_rank(user_address_param TEXT)
      RETURNS TABLE (rank BIGINT)
      LANGUAGE SQL
      AS $$
        SELECT ranked_users.rank FROM (
          SELECT
            u.address,
            ROW_NUMBER() OVER (ORDER BY (COALESCE(SUM(s.points), 0) + (COALESCE(mc.count, 0) * 150)) DESC) as rank
          FROM users u
          LEFT JOIN scores s ON u.address = s.user_address
          LEFT JOIN mint_counts mc ON u.address = mc.user_address
          GROUP BY u.address
        ) ranked_users
        WHERE address = user_address_param;
      $$
    `;
    console.log('✅ Created get_user_rank function');

    // get_user_total_points function
    await sql`
      CREATE OR REPLACE FUNCTION get_user_total_points(user_address_param TEXT)
      RETURNS TABLE (total_points BIGINT)
      LANGUAGE SQL
      AS $$
        SELECT COALESCE(SUM(s.points), 0) + (COALESCE(mc.count, 0) * 150) as total_points
        FROM users u
        LEFT JOIN scores s ON u.address = s.user_address
        LEFT JOIN mint_counts mc ON u.address = mc.user_address
        WHERE u.address = user_address_param
        GROUP BY u.address, mc.count;
      $$
    `;
    console.log('✅ Created get_user_total_points function');

    // get_mint_stats function
    await sql`
      CREATE OR REPLACE FUNCTION get_mint_stats()
      RETURNS TABLE (total_mints BIGINT, unique_users BIGINT)
      LANGUAGE SQL
      AS $$
        SELECT
          COALESCE(SUM(count), 0) as total_mints,
          COUNT(DISTINCT user_address) as unique_users
        FROM mint_counts;
      $$
    `;
    console.log('✅ Created get_mint_stats function');

    // Create trigger function for updated_at
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;
    console.log('✅ Created update_updated_at_column function');

    // Create triggers
    await sql`DROP TRIGGER IF EXISTS update_users_updated_at ON users`;
    await sql`CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;

    await sql`DROP TRIGGER IF EXISTS update_mint_counts_updated_at ON mint_counts`;
    await sql`CREATE TRIGGER update_mint_counts_updated_at BEFORE UPDATE ON mint_counts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;
    console.log('✅ Created triggers');

    console.log('\n🎉 Database setup complete!');
    console.log('Your Neon PostgreSQL database is ready for the leaderboard and scoring system.');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}