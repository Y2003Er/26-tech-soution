const pool = require('../config/db');

const SubscriberModel = {

  // Ongeza email mpya. Inarudisha { inserted: true } kama mpya,
  // au { inserted: false } kama tayari ipo (haitupi error).
  async create(email) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO subscribers (email) VALUES ($1)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [email]
      );
      return { inserted: rows.length > 0 };
    } catch (err) {
      console.error('Hitilafu kwenye SubscriberModel.create:', err.message);
      throw err;
    }
  },

  async count() {
    try {
      const { rows } = await pool.query(`SELECT COUNT(*) FROM subscribers`);
      return parseInt(rows[0].count, 10) || 0;
    } catch (err) {
      console.error('Hitilafu kwenye SubscriberModel.count:', err.message);
      throw err;
    }
  },
};

module.exports = SubscriberModel;