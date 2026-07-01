const pool   = require('../config/db');
const crypto = require('crypto');

const TokenModel = {

  // Tengeneza token mpya kwa app
  async create(appId) {
    const token     = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + (parseInt(process.env.TOKEN_EXPIRY_MINUTES) || 15) * 60 * 1000);

    await pool.query(
      `INSERT INTO download_tokens (token, app_id, expires_at) VALUES ($1, $2, $3)`,
      [token, appId, expiresAt]
    );
    return token;
  },

  // Angalia token — ipe app_id kama iko valid
  async verify(token) {
    const { rows } = await pool.query(
      `SELECT dt.*, a.download_url, a.name AS app_name, a.id AS app_id
       FROM download_tokens dt
       JOIN apps a ON a.id = dt.app_id
       WHERE dt.token = $1
         AND dt.used  = false
         AND dt.expires_at > NOW()`,
      [token]
    );
    return rows[0] || null;
  },

  // Weka token kama imetumika
  async markUsed(token) {
    await pool.query(
      `UPDATE download_tokens SET used = true WHERE token = $1`,
      [token]
    );
  },

  // Safisha tokens zilizokwisha muda (tumia cron au manual)
  async cleanup() {
    const { rowCount } = await pool.query(
      `DELETE FROM download_tokens WHERE expires_at < NOW() OR used = true`
    );
    return rowCount;
  },
};

module.exports = TokenModel;