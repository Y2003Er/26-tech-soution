const { Pool } = require('pg');
const dns = require('dns');
require('dotenv').config();

// Kulazimisha mfumo kupendelea IPv4 kuliko IPv6 ili kuepuka ENETUNREACH
dns.setDefaultResultOrder('ipv4first');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // Supabase pooler ina cheti kinachojulikana - rejectUnauthorized: true
    // ni salama hapa. Usizime uthibitisho wa TLS kabisa.
    rejectUnauthorized: true
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});

pool.connect()
  .then(client => {
    console.log('PostgreSQL imeungana kikamilifu na Supabase Pooler!');
    client.release();
  })
  .catch(err => {
    console.error('PostgreSQL haiwezi kuungana:', err.message);
  });

module.exports = pool;