// Endesha: ADMIN_EMAIL=wewe@mfano.com ADMIN_PASSWORD=password_yako node setup.js
// Inaunda admin user wa kwanza kwenye database
require('dotenv').config();
const crypto = require('crypto');
const AdminModel = require('./models/adminModel');

async function setup() {
  const email = process.env.ADMIN_EMAIL;
  const username = process.env.ADMIN_USERNAME || 'admin';

  if (!email) {
    console.error('Weka ADMIN_EMAIL kwenye .env au kwenye amri kabla ya kuendesha setup.js');
    process.exit(1);
  }

  const password = process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64');
  const isGenerated = !process.env.ADMIN_PASSWORD;

  try {
    const admin = await AdminModel.create({ email, password, username });
    console.log(`Admin imeundwa: ${admin.email}`);
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