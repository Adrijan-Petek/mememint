#!/usr/bin/env node

/**
 * Database Setup Script
 *
 * This script helps you set up your PostgreSQL database with the required tables and functions.
 *
 * To use this script:
 * 1. Make sure you have your DATABASE_URL set in .env.local
 * 2. Run this script: node setup-database.cjs
 */

const { Server } = require('@niledatabase/server');
require('dotenv').config({ path: '.env.local' });

console.log('🚀 Setting up PostgreSQL database...\n');

async function setupDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.log('❌ DATABASE_URL not found in .env.local');
    console.log('Please make sure your DATABASE_URL is set in .env.local');
    process.exit(1);
  }

  const nile = new Server({ secureCookies: process.env.VERCEL === "1" });

  try {
    console.log('📋 Creating tables...');

    // Create users table
    console.log('Creating users table...');
    await nile.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      address TEXT UNIQUE NOT NULL,
      fid INTEGER UNIQUE,
      name TEXT,
      pfp TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`);
    console.log('✅ Created users table');

    // Create scores table
    console.log('Creating scores table...');
    await nile.query(`CREATE TABLE IF NOT EXISTS scores (
      id SERIAL PRIMARY KEY,
      user_address TEXT NOT NULL,
      action TEXT NOT NULL CHECK (action IN ('generate', 'game', 'buy_token', 'hold_token')),
      points INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`);
    console.log('✅ Created scores table');

    // Create mint_counts table
    console.log('Creating mint_counts table...');
    await nile.query(`CREATE TABLE IF NOT EXISTS mint_counts (
      id SERIAL PRIMARY KEY,
      user_address TEXT UNIQUE NOT NULL,
      count INTEGER DEFAULT 0 NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`);
    console.log('✅ Created mint_counts table');

    // Create drops table for NFT drops
    console.log('Creating drops table...');
    await nile.query(`CREATE TABLE IF NOT EXISTS drops (
      id SERIAL PRIMARY KEY,
      drop_id INTEGER UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price_wei TEXT NOT NULL,
      supply INTEGER NOT NULL,
      minted INTEGER DEFAULT 0 NOT NULL,
      uri TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`);
    console.log('✅ Created drops table');

    // Create nft_mints table
    console.log('Creating nft_mints table...');
    await nile.query(`CREATE TABLE IF NOT EXISTS nft_mints (
      id SERIAL PRIMARY KEY,
      user_address TEXT NOT NULL,
      drop_id INTEGER NOT NULL,
      token_id INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      tx_hash TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`);
    console.log('✅ Created nft_mints table');

    // Create indexes
    console.log('Creating indexes...');
    await nile.query(`CREATE INDEX IF NOT EXISTS idx_scores_user_address ON scores(user_address)`);
    await nile.query(`CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores(created_at DESC)`);
    await nile.query(`CREATE INDEX IF NOT EXISTS idx_mint_counts_user_address ON mint_counts(user_address)`);
    await nile.query(`CREATE INDEX IF NOT EXISTS idx_drops_drop_id ON drops(drop_id)`);
    await nile.query(`CREATE INDEX IF NOT EXISTS idx_nft_mints_user_address ON nft_mints(user_address)`);
    await nile.query(`CREATE INDEX IF NOT EXISTS idx_nft_mints_drop_id ON nft_mints(drop_id)`);
    await nile.query(`CREATE INDEX IF NOT EXISTS idx_nft_mints_created_at ON nft_mints(created_at DESC)`);
    console.log('✅ Created indexes');

    console.log('\n🎉 Database setup complete! Tables and indexes created successfully.');
    console.log('Note: Nile does not support stored functions, so leaderboard logic is implemented in application code.');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}