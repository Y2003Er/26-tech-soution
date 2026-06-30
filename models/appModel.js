const pool = require('../config/db');

const AppModel = {

  // Leta apps zote (na filter + search + pagination)
  async getAll({ category, search, platform, sort = 'trending', limit = 20, offset = 0 } = {}) {
    let query = `
      SELECT id, name, slug, category, icon_file_id, description,
             version, file_size, os, is_free, is_featured,
             views, downloads, created_at, updated_at,
             developer, package_name, rating, mod_info,
             badges, screenshots, is_editors_choice
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
    if (platform && platform !== 'All') {
      params.push(platform);
      query += ` AND os = $${params.length}`;
    }

    const orderMap = {
      trending: 'downloads DESC, views DESC, created_at DESC',
      popular: 'views DESC, downloads DESC, created_at DESC',
      newest: 'created_at DESC',
      oldest: 'created_at ASC',
      downloads: 'downloads DESC, created_at DESC'
    };
    query += ` ORDER BY is_featured DESC, ${orderMap[sort] || orderMap.trending}`;
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
  async count({ category, search, platform } = {}) {
    let query = `SELECT COUNT(*) FROM apps WHERE is_active = true`;
    const params = [];
    if (category && category !== 'Zote') {
      params.push(category); query += ` AND category = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length} OR category ILIKE $${params.length})`;
    }
    if (platform && platform !== 'All') {
      params.push(platform);
      query += ` AND os = $${params.length}`;
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

  // Leta categories zote zilizopo (pamoja na category_image_url)
  async getCategories() {
    try {
      const { rows } = await pool.query(
        `SELECT a.category,
                COUNT(*) AS total,
                c.category_image_url
         FROM apps a
         LEFT JOIN categories c ON c.category = a.category
         WHERE a.is_active = true
         GROUP BY a.category, c.category_image_url
         ORDER BY total DESC`
      );
      return rows;
    } catch (err) {
      console.error('Hitilafu kwenye AppModel.getCategories:', err.message);
      throw err;
    }
  },

  async getHomeSections() {
    try {
      const baseSelect = `
        SELECT id, name, slug, category, icon_file_id, description,
               version, file_size, os, is_free, is_featured,
               views, downloads, created_at, updated_at,
               developer, package_name, rating, mod_info,
               badges, screenshots, is_editors_choice
        FROM apps
        WHERE is_active = true
      `;
      const [featured, trending, popular, latest, updated, recommended] = await Promise.all([
        pool.query(`${baseSelect} AND is_featured = true ORDER BY downloads DESC, created_at DESC LIMIT 8`),
        pool.query(`${baseSelect} ORDER BY downloads DESC, views DESC, created_at DESC LIMIT 8`),
        pool.query(`${baseSelect} ORDER BY views DESC, downloads DESC, created_at DESC LIMIT 12`),
        pool.query(`${baseSelect} ORDER BY created_at DESC LIMIT 8`),
        pool.query(`${baseSelect} ORDER BY updated_at DESC, created_at DESC LIMIT 8`),
        pool.query(`${baseSelect} ORDER BY (downloads + views) DESC, is_featured DESC, created_at DESC LIMIT 6`)
      ]);

      return {
        featured: featured.rows,
        trending: trending.rows,
        popular: popular.rows,
        latest: latest.rows,
        updated: updated.rows,
        recommended: recommended.rows
      };
    } catch (err) {
      console.error('Hitilafu kwenye AppModel.getHomeSections:', err.message);
      throw err;
    }
  },

  // Leta apps zinazofanana (same category)
  async getRelated(appId, category, limit = 4) {
    try {
      const { rows } = await pool.query(
        `SELECT id, name, slug, category, icon_file_id, version, file_size,
                is_free, downloads, rating, mod_info, badges
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

  // ── ADMIN QUERIES ──────────────────────────────

  async adminGetAll() {
    try {
      const { rows } = await pool.query(
        `SELECT id, name, slug, category, icon_file_id, version,
                file_size, os, is_free, is_featured, is_active,
                views, downloads, created_at, rating, mod_info,
                badges, is_editors_choice
         FROM apps ORDER BY created_at DESC`
      );
      return rows;
    } catch (err) {
      console.error('Hitilafu kwenye AppModel.adminGetAll:', err.message);
      throw err;
    }
  },

  async create({ name, slug, category, description, version,
                 file_size, os, is_free, download_url, is_featured,
                 is_active, icon_file_id, developer, package_name,
                 rating, mod_info, badges, screenshots, is_editors_choice }) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO apps
           (name, slug, category, description, version,
            file_size, os, is_free, download_url, is_featured,
            is_active, icon_file_id, developer, package_name,
            rating, mod_info, badges, screenshots, is_editors_choice)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
         RETURNING *`,
        [name, slug, category, description, version,
         file_size, os, is_free, download_url, is_featured,
         is_active !== undefined ? is_active : true, icon_file_id || null,
         developer || 'Verified Publisher', package_name || null,
         rating || 0, mod_info || null, badges || [], screenshots || [],
         is_editors_choice || false]
      );
      return rows[0];
    } catch (err) {
      console.error('Hitilafu kwenye AppModel.create:', err.message);
      throw err;
    }
  },

  async update(id, { name, slug, category, description, version,
                     file_size, os, is_free, download_url, is_featured,
                     is_active, icon_file_id, developer, package_name,
                     rating, mod_info, badges, screenshots, is_editors_choice }) {
    try {
      const { rows } = await pool.query(
        `UPDATE apps SET
           name=$1, slug=$2, category=$3, description=$4,
           version=$5, file_size=$6, os=$7, is_free=$8,
           download_url=$9, is_featured=$10, is_active=$11, icon_file_id=$12,
           developer=$13, package_name=$14, rating=$15, mod_info=$16,
           badges=$17, screenshots=$18, is_editors_choice=$19
         WHERE id=$20 RETURNING *`,
        [name, slug, category, description, version,
         file_size, os, is_free, download_url, is_featured,
         is_active, icon_file_id || null,
         developer || 'Verified Publisher', package_name || null,
         rating || 0, mod_info || null, badges || [], screenshots || [],
         is_editors_choice || false, id]
      );
      return rows[0];
    } catch (err) {
      console.error('Hitilafu kwenye AppModel.update:', err.message);
      throw err;
    }
  },

  async delete(id) {
    try {
      await pool.query(`DELETE FROM apps WHERE id = $1`, [id]);
    } catch (err) {
      console.error('Hitilafu kwenye AppModel.delete:', err.message);
      throw err;
    }
  },

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

  // ── CATEGORIES ADMIN (kwa category_image_url) ──

  async setCategoryImage(category, imageUrl) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO categories (category, category_image_url)
         VALUES ($1, $2)
         ON CONFLICT (category) DO UPDATE SET category_image_url = $2
         RETURNING *`,
        [category, imageUrl]
      );
      return rows[0];
    } catch (err) {
      console.error('Hitilafu kwenye AppModel.setCategoryImage:', err.message);
      throw err;
    }
  },
};

module.exports = AppModel;