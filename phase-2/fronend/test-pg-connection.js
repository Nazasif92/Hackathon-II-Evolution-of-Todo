require('dotenv').config();
const { Pool } = require('pg');

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'NOT SET');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Pool error:', err);
});

async function test() {
  try {
    console.log('Testing pg Pool connection...');
    console.log('Attempting to connect...');
    const client = await Promise.race([
      pool.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout after 10s')), 10000))
    ]);
    console.log('✅ Connected to database');

    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query successful:', result.rows[0]);

    // Check tables
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name IN ('user', 'session', 'account', 'verification')
    `);
    console.log('✅ Tables found:', tables.rows.map(r => r.table_name));

    client.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

test();
