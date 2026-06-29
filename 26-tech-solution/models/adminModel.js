const pool = require('../config/db');

const AdminModel = {
  // Hii ndiyo kazi inayotafuta admin kwa jina
  async findByUsername(username) {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM admins WHERE username = $1',
        [username]
      );
      return rows[0]; // Inarudisha admin aliyepatikana
    } catch (err) {
      console.error('Hitilafu kwenye AdminModel.findByUsername:', err.message);
      throw err;
    }
  }
};

module.exports = AdminModel;