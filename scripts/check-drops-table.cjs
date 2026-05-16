const { Server } = require('@niledatabase/server');
require('dotenv').config({ path: '.env.local' });

(async () => {
  try {
    const nile = new Server({ secureCookies: process.env.VERCEL === '1' });
    console.log('Using DATABASE_URL:', process.env.DATABASE_URL ? '[REDACTED]' : 'not set');

    const tables = await nile.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
    console.log('Tables:', tables?.rows?.map(r => r.table_name).join(', '));

    const cols = await nile.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'drops' ORDER BY ordinal_position");
    if (!cols || !cols.rows || cols.rows.length === 0) {
      console.log('No columns found for table `drops`.');
    } else {
      console.log('Columns for drops:');
      cols.rows.forEach((c) => console.log(` - ${c.column_name}: ${c.data_type}`));
    }

    // Also try a sample select to see if table exists
    try {
      const sample = await nile.query('SELECT * FROM drops LIMIT 1');
      console.log('Sample select succeeded, rowcount:', sample?.rows?.length || 0);
    } catch (e) {
      console.error('Sample select error:', e instanceof Error ? e.message : e);
    }
  } catch (err) {
    console.error('Script error:', err instanceof Error ? err.message : err);
  }
})();