const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const AdminModel = {

  async findByUsername(username) {
    const { rows } = await pool.query(
      `SELECT * FROM admins WHERE username = $1`,
      [username]
    );
    return rows[0] || null;
  },

  async verifyPassword(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
  },

  // Tumia hii kwenye setup.js kuunda admin wa kwanza
  async create(username, plainPassword) {
    const hash = await bcrypt.hash(plainPassword, 12);
    const { rows } = await pool.query(
      `INSERT INTO admins (username, password_hash) VALUES ($1, $2) RETURNING id, username`,
      [username, hash]
    );
    return rows[0];
  },
};

module.exports = AdminModel;
