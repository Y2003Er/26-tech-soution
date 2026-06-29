// Endesha: node setup.js
// Inaunda admin user wa kwanza kwenye database
require('dotenv').config();
const AdminModel = require('./models/adminModel');

async function setup() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'change_me_123';
  try {
    const admin = await AdminModel.create(username, password);
    console.log(`✅ Admin imeundwa: ${admin.username}`);
    console.log(`   Ingia kwenye /admin/login`);
    process.exit(0);
  } catch (err) {
    if (err.message.includes('unique')) {
      console.log('ℹ️  Admin tayari yupo.');
    } else {
      console.error('❌ Error:', err.message);
    }
    process.exit(0);
  }
}
setup();
