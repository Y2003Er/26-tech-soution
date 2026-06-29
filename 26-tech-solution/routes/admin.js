const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');

function requireAuth(req, res, next) {
  if (!req.session.admin) return res.redirect('/admin/login');
  next();
}

router.get('/login', AdminController.loginPage);
router.post('/login', AdminController.loginPost);
router.post('/logout', AdminController.logout);

router.get('/', requireAuth, AdminController.dashboard);
router.get('/apps/new', requireAuth, AdminController.newAppPage);
router.post('/apps', requireAuth, AdminController.createApp);
router.get('/apps/:id/edit', requireAuth, AdminController.editAppPage);
router.post('/apps/:id/edit', requireAuth, AdminController.updateApp);
router.post('/apps/:id/delete', requireAuth, AdminController.deleteApp);

module.exports = router;