// Endesha: node setup.js
// Inaunda admin user wa kwanza kwenye database
require('dotenv').config();
const crypto = require('crypto');
const AdminModel = require('./models/adminModel');

async function setup() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  // Kama hujaweka ADMIN_PASSWORD kwenye .env, tunatengeneza password ya random
  // na kuiprint mara moja - usiitumie default ya kubahatisha.
  const password = process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64');
  const isGenerated = !process.env.ADMIN_PASSWORD;

  try {
    const admin = await AdminModel.create(username, password);
    console.log(`Admin imeundwa: ${admin.username}`);
    if (isGenerated) {
      console.log(`Password ya kiotomatiki: ${password}`);
      console.log('Iandike mahali salama - haitaonyeshwa tena.');
    }
    console.log('Ingia kwenye /admin/login');
    process.exit(0);
  } catch (err) {
    if (err.message.includes('unique')) {
      console.log('Admin tayari yupo.');
    } else {
      console.error('Error:', err.message);
    }
    process.exit(0);
  }
}
setup();