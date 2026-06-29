const pool = require('../config/db');

const AppModel = {

  // Leta apps zote (na filter + search)
  async getAll({ category, search, limit = 20, offset = 0 } = {}) {
    let query = `
      SELECT id, name, slug, category, icon, description,
             version, file_size, os, is_free, is_featured,
             views, downloads, created_at
      FROM apps
      WHERE is_active = true
    `;
    const params = [];

    if (category && category !== 'Zote') {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length} OR category ILIKE $${params.length})`;
    }

    query += ` ORDER BY is_featured DESC, downloads DESC, created_at DESC`;
    params.push(limit);   query += ` LIMIT $${params.length}`;
    params.push(offset);  query += ` OFFSET $${params.length}`;

    const { rows } = await pool.query(query, params);
    return rows;
  },

  // Hesabu jumla ya apps (kwa pagination)
  async count({ category, search } = {}) {
    let query = `SELECT COUNT(*) FROM apps WHERE is_active = true`;
    const params = [];
    if (category && category !== 'Zote') {
      params.push(category); query += ` AND category = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }
    const { rows } = await pool.query(query, params);
    return parseInt(rows[0].count);
  },

  // Leta app moja kwa slug
  async getBySlug(slug) {
    const { rows } = await pool.query(
      `SELECT * FROM apps WHERE slug = $1 AND is_active = true`,
      [slug]
    );
    return rows[0] || null;
  },

  // Leta app moja kwa id
  async getById(id) {
    const { rows } = await pool.query(
      `SELECT * FROM apps WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  // Ongeza view count
  async incrementViews(id) {
    await pool.query(
      `UPDATE apps SET views = views + 1 WHERE id = $1`,
      [id]
    );
  },

  // Ongeza download count
  async incrementDownloads(id) {
    await pool.query(
      `UPDATE apps SET downloads = downloads + 1 WHERE id = $1`,
      [id]
    );
  },

  // Leta categories zote zilizopo
  async getCategories() {
    const { rows } = await pool.query(
      `SELECT DISTINCT category, COUNT(*) as total
       FROM apps WHERE is_active = true
       GROUP BY category ORDER BY total DESC`
    );
    return rows;
  },

  // Leta apps zinazofanana (same category)
  async getRelated(appId, category, limit = 4) {
    const { rows } = await pool.query(
      `SELECT id, name, slug, category, icon, version, file_size, is_free, downloads
       FROM apps
       WHERE is_active = true AND id != $1 AND category = $2
       ORDER BY downloads DESC LIMIT $3`,
      [appId, category, limit]
    );
    return rows;
  },

  // ── ADMIN QUERIES ──────────────────────────────

  // Leta apps zote (admin — ikiwemo zisizokuwa active)
  async adminGetAll() {
    const { rows } = await pool.query(
      `SELECT id, name, slug, category, icon, version,
              file_size, os, is_free, is_featured, is_active,
              views, downloads, created_at
       FROM apps ORDER BY created_at DESC`
    );
    return rows;
  },

  // Ongeza app mpya
  async create({ name, slug, category, icon, description, version,
                 file_size, os, is_free, download_url, is_featured }) {
    const { rows } = await pool.query(
      `INSERT INTO apps
         (name, slug, category, icon, description, version,
          file_size, os, is_free, download_url, is_featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [name, slug, category, icon, description, version,
       file_size, os, is_free, download_url, is_featured]
    );
    return rows[0];
  },

  // Hariri app
  async update(id, { name, slug, category, icon, description, version,
                     file_size, os, is_free, download_url, is_featured, is_active }) {
    const { rows } = await pool.query(
      `UPDATE apps SET
         name=$1, slug=$2, category=$3, icon=$4, description=$5,
         version=$6, file_size=$7, os=$8, is_free=$9,
         download_url=$10, is_featured=$11, is_active=$12
       WHERE id=$13 RETURNING *`,
      [name, slug, category, icon, description, version,
       file_size, os, is_free, download_url, is_featured, is_active, id]
    );
    return rows[0];
  },

  // Futa app
  async delete(id) {
    await pool.query(`DELETE FROM apps WHERE id = $1`, [id]);
  },

  // Stats za dashboard
  async getStats() {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*)                                         AS total_apps,
        COUNT(*) FILTER (WHERE is_active)               AS active_apps,
        COUNT(*) FILTER (WHERE is_featured)             AS featured_apps,
        COALESCE(SUM(views), 0)                         AS total_views,
        COALESCE(SUM(downloads), 0)                     AS total_downloads
      FROM apps
    `);
    return rows[0];
  },
};

module.exports = AppModel;
