const pool = require('../config/db');

const AppModel = {

  // Leta apps zote (na filter + search)
  async getAll({ category, search, limit = 20, offset = 0 } = {}) {
    let query = `
      SELECT id, name, slug, category, description,
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

    try {
      const { rows } = await pool.query(query, params);
      return rows;
    } catch (err) {
      console.error('Hitilafu kwenye AppModel.getAll:', err.message);
      throw err;
    }
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
    try {
      const { rows } = await pool.query(query, params);
      return parseInt(rows[0].count, 10) || 0;
    } catch (err) {
      console.error('Hitilafu kwenye AppModel.count:', err.message);
      throw err;
    }
  },

  // Leta app moja kwa slug
  async getBySlug(slug) {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM apps WHERE slug = $1 AND is_active = true`,
        [slug]
      );
      return rows[0] || null;
    } catch (err) {
      console.error('Hitilafu kwenye AppModel.getBySlug:', err.message);
      throw err;
    }
  },

  // Leta app moja kwa id
  async getById(id) {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM apps WHERE id = $1`,
        [id]
      );
      return rows[0] || null;
    } catch (err) {
      console.error('Hitilafu kwenye AppModel.getById:', err.message);
      throw err;
    }
  },

  // Ongeza view count
  async incrementViews(id) {
    try {
      await pool.query(
        `UPDATE apps SET views = views + 1 WHERE id = $1`,
        [id]
      );
    } catch (err) {
      console.error('Hitilafu kwenye AppModel.incrementViews:', err.message);
    }
  },

  // Ongeza download count
  async incrementDownloads(id) {
    try {
      await pool.query(
        `UPDATE apps SET downloads = downloads + 1 WHERE id = $1`,
        [id]
      );
    } catch (err) {
      console.error('Hitilafu kwenye AppModel.incrementDownloads:', err.message);
    }
  },

  // Leta categories zote zilizopo
  async getCategories() {
    try {
      const { rows } = await pool.query(
        `SELECT DISTINCT category, COUNT(*) as total
         FROM apps WHERE is_active = true
         GROUP BY category ORDER BY total DESC`
      );
      return rows;
    } catch (err) {
      console.error('Hitilafu kwenye AppModel.getCategories:', err.message);
      throw err;
    }
  },

  // Leta apps zinazofanana (same category)
  async getRelated(appId, category, limit = 4) {
    try {
      const { rows } = await pool.query(
        `SELECT id, name, slug, category, version, file_size, is_free, downloads
         FROM apps
         WHERE is_active = true AND id != $1 AND category = $2
         ORDER BY downloads DESC LIMIT $3`,
        [appId, category, limit]
      );
      return rows;
    } catch (err) {
      console.error('Hitilafu kwenye AppModel.getRelated:', err.message);
      throw err;
    }
  },

  // ---- ADMIN QUERIES ----

  // Leta apps zote (admin - ikiwemo zisizokuwa active)
  async adminGetAll() {
    try {
      const { rows } = await pool.query(
        `SELECT id, name, slug, category, version,
                file_size, os, is_free, is_featured, is_active,
                views, downloads, created_at
         FROM apps ORDER BY created_at DESC`
      );
      return rows;
    } catch (err) {
      console.error('Hitilafu kwenye AppModel.adminGetAll:', err.message);
      throw err;
    }
  },

  // Ongeza app mpya
  async create({ name, slug, category, description, version,
                 file_size, os, is_free, download_url, is_featured }) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO apps
           (name, slug, category, description, version,
            file_size, os, is_free, download_url, is_featured)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING *`,
        [name, slug, category, description, version,
         file_size, os, is_free, download_url, is_featured]
      );
      return rows[0];
    } catch (err) {
      console.error('Hitilafu kwenye AppModel.create:', err.message);
      throw err;
    }
  },

  // Hariri app
  async update(id, { name, slug, category, description, version,
                     file_size, os, is_free, download_url, is_featured, is_active }) {
    try {
      const { rows } = await pool.query(
        `UPDATE apps SET
           name=$1, slug=$2, category=$3, description=$4,
           version=$5, file_size=$6, os=$7, is_free=$8,
           download_url=$9, is_featured=$10, is_active=$11
         WHERE id=$12 RETURNING *`,
        [name, slug, category, description, version,
         file_size, os, is_free, download_url, is_featured, is_active, id]
      );
      return rows[0];
    } catch (err) {
      console.error('Hitilafu kwenye AppModel.update:', err.message);
      throw err;
    }
  },

  // Futa app
  async delete(id) {
    try {
      await pool.query(`DELETE FROM apps WHERE id = $1`, [id]);
    } catch (err) {
      console.error('Hitilafu kwenye AppModel.delete:', err.message);
      throw err;
    }
  },

  // Stats za dashboard
  async getStats() {
    try {
      const { rows } = await pool.query(`
        SELECT
          COUNT(*)                                        AS total_apps,
          COUNT(*) FILTER (WHERE is_active)               AS active_apps,
          COUNT(*) FILTER (WHERE is_featured)             AS featured_apps,
          COALESCE(SUM(views), 0)                         AS total_views,
          COALESCE(SUM(downloads), 0)                     AS total_downloads
        FROM apps
      `);
      return rows[0];
    } catch (err) {
      console.error('Hitilafu kwenye AppModel.getStats:', err.message);
      throw err;
    }
  },
};

module.exports = AppModel;