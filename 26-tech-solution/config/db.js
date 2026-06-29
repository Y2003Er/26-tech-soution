const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('⚠️  PostgreSQL pool error:', err.message);
});

// Test connection wakati wa kuanza
pool.connect()
  .then(client => {
    console.log('✅ PostgreSQL imeungana');
    client.release();
  })
  .catch(err => {
    console.error('❌ PostgreSQL haiwezi kuungana:', err.message);
    process.exit(1);
  });

module.exports = pool;
