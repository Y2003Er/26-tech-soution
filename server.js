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
      CREATE TABLE IF NOT EXISTS apps (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(200) NOT NULL UNIQUE,
        category VARCHAR(80) NOT NULL,
        icon_file_id VARCHAR(500),
        description TEXT NOT NULL,
        version VARCHAR(50) NOT NULL DEFAULT 'v1.0',
        file_size VARCHAR(30) NOT NULL DEFAULT '-',
        os VARCHAR(30) NOT NULL DEFAULT 'Windows',
        is_free BOOLEAN NOT NULL DEFAULT true,
        download_url TEXT NOT NULL,
        views INTEGER NOT NULL DEFAULT 0,
        downloads INTEGER NOT NULL DEFAULT 0,
        is_featured BOOLEAN NOT NULL DEFAULT false,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await pool.query(`ALTER TABLE apps ADD COLUMN IF NOT EXISTS icon_file_id VARCHAR(500);`);
    await pool.query(`ALTER TABLE apps ADD COLUMN IF NOT EXISTS views INTEGER NOT NULL DEFAULT 0;`);
    await pool.query(`ALTER TABLE apps ADD COLUMN IF NOT EXISTS downloads INTEGER NOT NULL DEFAULT 0;`);
    await pool.query(`ALTER TABLE apps ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;`);
    await pool.query(`ALTER TABLE apps ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;`);
    await pool.query(`ALTER TABLE apps ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();`);
    await pool.query(`ALTER TABLE apps ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();`);

    // ── Fields mpya (LiteAPKs-style): developer, package_name, rating,
    //    mod_info, badges, screenshots, is_editors_choice ──
    await pool.query(`ALTER TABLE apps ADD COLUMN IF NOT EXISTS developer VARCHAR(150) DEFAULT 'Verified Publisher';`);
    await pool.query(`ALTER TABLE apps ADD COLUMN IF NOT EXISTS package_name VARCHAR(150);`);
    await pool.query(`ALTER TABLE apps ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) DEFAULT 0.0;`);
    await pool.query(`ALTER TABLE apps ADD COLUMN IF NOT EXISTS mod_info VARCHAR(200);`);
    await pool.query(`ALTER TABLE apps ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';`);
    await pool.query(`ALTER TABLE apps ADD COLUMN IF NOT EXISTS screenshots TEXT[] DEFAULT '{}';`);
    await pool.query(`ALTER TABLE apps ADD COLUMN IF NOT EXISTS is_editors_choice BOOLEAN NOT NULL DEFAULT false;`);

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_apps_slug ON apps(slug);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_apps_active ON apps(is_active);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_apps_rating ON apps(rating DESC);`);

    // ── FIX: dollar-quote ilikuwa "$" moja badala ya "$$" - hii ndiyo
    //    iliyokuwa ikitupa "syntax error at or near $" ──
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $$ LANGUAGE plpgsql;
    `);
    await pool.query(`DROP TRIGGER IF EXISTS apps_updated_at ON apps;`);
    await pool.query(`
      CREATE TRIGGER apps_updated_at
      BEFORE UPDATE ON apps
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
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