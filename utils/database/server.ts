import { Server } from '@niledatabase/server'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const databaseUrl = process.env.DATABASE_URL!

// Create database client for server-side usage
const nile = new Server({
  secureCookies: process.env.VERCEL === "1",
  apiUrl: process.env.NILEDB_API_URL
})
export const sql = async (query: string, params?: any[]) => {
  const result = await nile.query(query, params)
  // Handle different result structures
  if (Array.isArray(result)) {
    return result
  }
  if (result && result.rows) {
    return result.rows
  }
  if (result && typeof result === 'object' && 'length' in result) {
    return Array.from(result)
  }
  // Fallback
  return []
}

// For backward compatibility, create a mock server client
export async function createClient() {
  return {
    from: (table: string) => ({
      select: (columns: string = '*') => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            const query = `SELECT ${columns} FROM ${table} WHERE ${column} = $1 LIMIT 1`
            const result = await nile.query(query, [value])
            return { data: result.rows[0] || null, error: null }
          }
        })
      })
    })
  }
}