const bcrypt = require('bcrypt');
const pool = require('./config/db');

async function createAdmin() {
  const passwordPlain = 'admin123'; // Hii ndio password yako ya kwanza
  const hashedPassword = await bcrypt.hash(passwordPlain, 10);
  
  try {
    await pool.query(
      'INSERT INTO admins (username, password) VALUES ($1, $2)',
      ['admin', hashedPassword]
    );
    console.log("✅ Admin ameongezwa! Username: admin, Password: admin123");
  } catch (err) {
    console.error("❌ Hitilafu: Huenda admin yupo tayari au database ina tatizo.", err.message);
  }
}

createAdmin();