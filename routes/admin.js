// routes/admin.js
const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const requireAdmin = require('../middleware/admin');
const { upload, uploadImage } = require('../middleware/upload');

// ============================================
// LOGIN (Hazihitaji uthibitisho)
// ============================================
router.get('/login', AdminController.loginPage);
router.post('/login', AdminController.loginPost);
router.post('/logout', AdminController.logout);

// ============================================
// ADMIN ROUTES (Zote zinalindwa)
// ============================================
router.get('/', requireAdmin, AdminController.dashboard);

// CRUD za Apps
router.get('/apps/new', requireAdmin, AdminController.newAppPage);
router.post('/apps', requireAdmin, upload.single('icon'), uploadImage, AdminController.createApp);
router.get('/apps/:id/edit', requireAdmin, AdminController.editAppPage);
router.post('/apps/:id/edit', requireAdmin, upload.single('icon'), uploadImage, AdminController.updateApp);
router.post('/apps/:id/delete', requireAdmin, AdminController.deleteApp);

// ============================================
// ROUTE ZA SIGNUP ZIMEONDOLWA
// ============================================

module.exports = router;