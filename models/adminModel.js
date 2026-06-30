const pool = require('../config/db');
const bcrypt = require('bcrypt');

const AdminModel = {

  // Tafuta admin kwa email
  async findByEmail(email) {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM admins WHERE email = $1',
        [email.toLowerCase().trim()]
      );
      return rows[0];
    } catch (err) {
      console.error('Hitilafu kwenye AdminModel.findByEmail:', err.message);
      throw err;
    }
  },

  // Angalia kama email tayari ipo
  async emailExists(email) {
    try {
      const { rows } = await pool.query(
        'SELECT id FROM admins WHERE email = $1',
        [email.toLowerCase().trim()]
      );
      return rows.length > 0;
    } catch (err) {
      console.error('Hitilafu kwenye AdminModel.emailExists:', err.message);
      throw err;
    }
  },

  // Sajili admin mpya
  async create({ email, password, username }) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const { rows } = await pool.query(
        `INSERT INTO admins (email, password, username)
         VALUES ($1, $2, $3)
         RETURNING id, email, username, created_at`,
        [email.toLowerCase().trim(), hashedPassword, username || null]
      );
      return rows[0];
    } catch (err) {
      console.error('Hitilafu kwenye AdminModel.create:', err.message);
      throw err;
    }
  },

  // Thibitisha password
  async verifyPassword(inputPassword, hashedPassword) {
    try {
      if (!inputPassword || !hashedPassword) {
        console.error(`⚠️ bcrypt imefeli: inputPassword=${!!inputPassword}, hashedPassword=${!!hashedPassword}`);
        return false;
      }
      return await bcrypt.compare(inputPassword, hashedPassword);
    } catch (err) {
      console.error('Hitilafu kwenye AdminModel.verifyPassword:', err.message);
      return false;
    }
  }
};

module.exports = AdminModel;