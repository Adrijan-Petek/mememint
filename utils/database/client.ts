import { Server } from '@niledatabase/server'

const databaseUrl = process.env.DATABASE_URL!

// Create database client
const nile = new Server({ secureCookies: process.env.VERCEL === "1" })
export const sql = async (query: string, params?: any[]) => {
  const result = await nile.query(query, params)
  return result.rows
}

// Database client with compatibility interface for existing code
export const db = {
  from: (table: string) => ({
    select: (columns: string = '*') => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          const query = `SELECT ${columns} FROM ${table} WHERE ${column} = $1 LIMIT 1`
          const result = await nile.query(query, [value])
          return { data: result.rows[0] || null, error: null }
        }
      }),
      order: (column: string, options?: { ascending?: boolean }) => ({
        limit: (count: number) => ({
          async execute() {
            const orderDirection = options?.ascending === false ? 'DESC' : 'ASC'
            const query = `SELECT ${columns} FROM ${table} ORDER BY ${column} ${orderDirection} LIMIT ${count}`
            const result = await nile.query(query)
            return { data: result.rows, error: null }
          }
        })
      })
    }),
    insert: (data: any) => ({
      select: () => ({
        single: async () => {
          const columns = Object.keys(data).join(', ')
          const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ')
          const values = Object.values(data)
          const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`
          const result = await nile.query(query, values)
          return { data: result.rows[0] || null, error: null }
        }
      })
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        select: () => ({
          single: async () => {
            const setClause = Object.keys(data).map((key, i) => `${key} = $${i + 1}`).join(', ')
            const values = [...Object.values(data), value]
            const query = `UPDATE ${table} SET ${setClause} WHERE ${column} = $${values.length} RETURNING *`
            const result = await nile.query(query, values)
            return { data: result.rows[0] || null, error: null }
          }
        })
      })
    }),
    upsert: (data: any, options?: { onConflict?: string; onConflictColumns?: string[] }) => ({
      async execute() {
        const columns = Object.keys(data).join(', ')
        const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ')
        const values = Object.values(data)

        let query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`

        if (options?.onConflict) {
          query += ` ON CONFLICT (${options.onConflict}) DO UPDATE SET `
          const updates = Object.keys(data).map(key => `${key} = EXCLUDED.${key}`).join(', ')
          query += updates
        }

        query += ' RETURNING *'

        const result = await nile.query(query, values)
        return { data: result.rows, error: null }
      }
    })
  }),
  rpc: (functionName: string, params?: any) => ({
    async execute() {
      // Handle specific RPC functions
      if (functionName === 'get_leaderboard') {
        const limit = params?.limit_param || 100
        const query = `
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
          LIMIT $1
        `
        const result = await nile.query(query, [limit])
        return { data: result.rows, error: null }
      }

      if (functionName === 'get_leaderboard_stats') {
        const query = `
          SELECT
            COUNT(DISTINCT u.address) as total_users,
            COALESCE(SUM(s.points), 0) + (COALESCE(SUM(mc.count), 0) * 150) as total_score
          FROM users u
          LEFT JOIN scores s ON u.address = s.user_address
          LEFT JOIN mint_counts mc ON u.address = mc.user_address
        `
        const result = await nile.query(query)
        return { data: result.rows, error: null }
      }

      if (functionName === 'get_user_rank') {
        const query = `
          SELECT rank FROM (
            SELECT
              u.address,
              ROW_NUMBER() OVER (ORDER BY (COALESCE(SUM(s.points), 0) + (COALESCE(mc.count, 0) * 150)) DESC) as rank
            FROM users u
            LEFT JOIN scores s ON u.address = s.user_address
            LEFT JOIN mint_counts mc ON u.address = mc.user_address
            GROUP BY u.address
          ) ranked_users
          WHERE address = $1
        `
        const result = await nile.query(query, [params?.user_address_param])
        return { data: result.rows, error: null }
      }

      if (functionName === 'get_user_total_points') {
        const query = `
          SELECT COALESCE(SUM(s.points), 0) + (COALESCE(mc.count, 0) * 150) as total_points
          FROM users u
          LEFT JOIN scores s ON u.address = s.user_address
          LEFT JOIN mint_counts mc ON u.address = mc.user_address
          WHERE u.address = $1
          GROUP BY u.address, mc.count
        `
        const result = await nile.query(query, [params?.user_address_param])
        return { data: result.rows, error: null }
      }

      if (functionName === 'increment_mint_count') {
        const query = `
          INSERT INTO mint_counts (user_address, count, updated_at)
          VALUES ($1, 1, NOW())
          ON CONFLICT (user_address)
          DO UPDATE SET count = mint_counts.count + 1, updated_at = NOW()
          RETURNING *
        `
        const result = await nile.query(query, [params?.user_address_param])
        return { data: result.rows, error: null }
      }
    }
  })
}