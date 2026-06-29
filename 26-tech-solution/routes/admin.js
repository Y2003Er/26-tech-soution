const express         = require('express');
const router          = express.Router();
const AdminController = require('../controllers/adminController');

// Middleware ya kulinda njia zote za admin
function requireAuth(req, res, next) {
  if (req.session?.admin) return next();
  res.redirect('/admin/login');
}

// Auth
router.get('/login',  AdminController.loginPage);
router.post('/login', AdminController.loginPost);
router.post('/logout', AdminController.logout);

// Dashboard (protected)
router.get('/', requireAuth, AdminController.dashboard);

// App CRUD (protected)
router.get('/apps/new',          requireAuth, AdminController.newAppPage);
router.post('/apps',             requireAuth, AdminController.createApp);
router.get('/apps/:id/edit',     requireAuth, AdminController.editAppPage);
router.post('/apps/:id/edit',    requireAuth, AdminController.updateApp);
router.post('/apps/:id/delete',  requireAuth, AdminController.deleteApp);

module.exports = router;
