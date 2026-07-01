// routes/admin.js
const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const requireAdmin = require('../middleware/admin');
const { upload, uploadImage } = require('../middleware/upload');

router.get('/login', AdminController.loginPage);
router.post('/login', AdminController.loginPost);
router.post('/logout', AdminController.logout);

router.get('/', requireAdmin, AdminController.dashboard);

const appUploads = upload.fields([
  { name: 'icon', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]);

router.get('/apps/new', requireAdmin, AdminController.newAppPage);
router.post('/apps', requireAdmin, appUploads, uploadImage, AdminController.createApp);
router.get('/apps/:id/edit', requireAdmin, AdminController.editAppPage);
router.post('/apps/:id/edit', requireAdmin, appUploads, uploadImage, AdminController.updateApp);
router.post('/apps/:id/delete', requireAdmin, AdminController.deleteApp);

module.exports = router;