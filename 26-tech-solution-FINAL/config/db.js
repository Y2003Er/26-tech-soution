const { Pool } = require('pg');
const dns = require('dns');
require('dotenv').config();

// Kulazimisha mfumo kupendelea IPv4 kuliko IPv6 ili kuepuka ENETUNREACH
dns.setDefaultResultOrder('ipv4first');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // Inazuia Node.js kukataa cheti cha Supabase (Inamaliza kosa la self-signed certificate)
    rejectUnauthorized: false 
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('⚠️  PostgreSQL pool error:', err.message);
});

// Test connection wakati wa kuanza seva
pool.connect()
  .then(client => {
    console.log('✅ PostgreSQL imeungana kikamilifu na Supabase Pooler!');
    client.release();
  })
  .catch(err => {
    console.error('❌ PostgreSQL haiwezi kuungana:', err.message);
  });

module.exports = pool;