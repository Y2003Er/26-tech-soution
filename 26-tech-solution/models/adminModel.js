const pool = require('../config/db');
const crypto = require('crypto');

const TokenModel = {

  async create(appId, expiresInMinutes = 30) {
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    try {
      const { rows } = await pool.query(
        `INSERT INTO download_tokens (token, app_id, expires_at) VALUES ($1, $2, $3) RETURNING *`,
        [token, appId, expiresAt]
      );
      return rows[0];
    } catch (err) {
      console.error('Hitilafu kwenye TokenModel.create:', err.message);
      throw err;
    }
  },

  async findValid(token) {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM download_tokens WHERE token = $1 AND used = false AND expires_at > NOW()`,
        [token]
      );
      return rows[0] || null;
    } catch (err) {
      console.error('Hitilafu kwenye TokenModel.findValid:', err.message);
      throw err;
    }
  },

  async markUsed(token) {
    try {
      await pool.query(`UPDATE download_tokens SET used = true WHERE token = $1`, [token]);
    } catch (err) {
      console.error('Hitilafu kwenye TokenModel.markUsed:', err.message);
    }
  },
};

module.exports = TokenModel;