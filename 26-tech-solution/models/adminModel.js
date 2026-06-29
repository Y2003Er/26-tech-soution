const pool = require('../config/db');
const bcrypt = require('bcrypt'); // au 'bcryptjs'

const AdminModel = {
  async findByUsername(username) {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM admins WHERE username = $1',
        [username]
      );
      
      // HAPA: Tutaona kwenye terminal admin anarudisha nini
      if (rows[0]) {
        console.log("➡️ Data ya Admin kutoka DB:", rows[0]);
      }
      
      return rows[0];
    } catch (err) {
      console.error('Hitilafu kwenye AdminModel.findByUsername:', err.message);
      throw err;
    }
  },

  async verifyPassword(inputPassword, hashedPassword) {
    try {
      // HAPA: Kama hashedPassword haipo, tutatumia mbadala au tutatoa taarifa mapema
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