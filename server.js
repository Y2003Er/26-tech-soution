// server.js
require('dotenv').config();

const express = require('express');
const flash = require('connect-flash');
const path = require('path');
const pool = require('./config/db');
const sessionConfig = require('./config/session'); // ← MPYA
const requireAdmin = require('./middleware/admin'); // ← MPYA

const app = express();

// ── Trust Proxy ──────────────────────────────
app.set('trust proxy', 1);

// ── Database Initialization ──────────────────
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        password VARCHAR(255) NOT NULL
      );
    `);

    await pool.query(`
      ALTER TABLE admins ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;
    `);
    await pool.query(`
      ALTER TABLE admins ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
    `);

    await pool.query(`
      ALTER TABLE apps ADD COLUMN IF NOT EXISTS icon_file_id VARCHAR(500);
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        category            VARCHAR(80) PRIMARY KEY,
        category_image_url  TEXT
      );
    `);

    console.log("Database tables ziko tayari!");
  } catch (err) {
    console.error("Hitilafu kuunda/kusasisha tables:", err.message);
  }
}

// ── View engine ──────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Static files ─────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Body parsers ─────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── Session (Inatumia config/session.js) ────
app.use(sessionConfig); // ← BADILISHA

// ── Flash messages ───────────────────────────
app.use(flash());

// ── Global locals ────────────────────────────
app.use((req, res, next) => {
  res.locals.siteName = '26 Tech Solution';
  res.locals.year = new Date().getFullYear();
  next();
});

// ── Routes ───────────────────────────────────
app.use('/', require('./routes/index'));
app.use('/', require('./routes/download'));
app.use('/admin', require('./routes/admin')); // Route za admin zinalindwa ndani ya route file

// ── 404 handler ──────────────────────────────
app.use((req, res) => {
  res.status(404).render('error', {
    title: '404 — Ukurasa Haupatikani',
    code: '404',
    message: 'Ukurasa ulioutafuta haupo.',
  });
});

// ── Error handler ────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).render('error', {
    title: 'Hitilafu — 26 Tech Solution',
    code: '500',
    message: 'Kuna tatizo la seva. Jaribu tena baadaye.',
  });
});

// ── Start ────────────────────────────────────
const PORT = process.env.PORT || 3000;

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`26 Tech Solution inaendesha kwenye http://localhost:${PORT}`);
  });
});