// ═══════════════════════════════════════════
// 26-TECH ADMIN CONTROLLER (TELEGRAM COMPATIBLE)
// ═══════════════════════════════════════════

const AppModel = require('../models/appModel');
const AdminModel = require('../models/adminModel');
// Vuta huduma ya Telegram tuliyotengeneza
const TelegramService = require('../services/telegramService'); 

// Helper: tengeneza slug kutoka kwa jina
function makeSlug(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const AdminController = {

  // GET /admin/login
  loginPage(req, res) {
    if (req.session.admin) return res.redirect('/admin');
    res.render('admin/login', {
      title: 'Admin Login - 26 Tech',
      error: req.flash('error'),
    });
  },

  // POST /admin/login
  async loginPost(req, res) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        req.flash('error', 'Jaza sehemu zote.');
        return res.redirect('/admin/login');
      }

      const admin = await AdminModel.findByUsername(username);
      if (!admin) {
        req.flash('error', 'Jina au nywila si sahihi.');
        return res.redirect('/admin/login');
      }

      const ok = await AdminModel.verifyPassword(password, admin.password);
      if (!ok) {
        req.flash('error', 'Jina au nywila si sahihi.');
        return res.redirect('/admin/login');
      }

      req.session.admin = { id: admin.id, username: admin.username };
      res.redirect('/admin');
    } catch (err) {
      console.error('login error:', err);
      req.flash('error', 'Hitilafu ya seva.');
      res.redirect('/admin/login');
    }
  },

  // POST /admin/logout
  logout(req, res) {
    req.session.destroy(() => res.redirect('/admin/login'));
  },

  // GET /admin - Dashboard
  async dashboard(req, res) {
    try {
      const [apps, stats] = await Promise.all([
        AppModel.adminGetAll(),
        AppModel.getStats(),
      ]);
      res.render('admin/dashboard', {
        title: 'Admin Dashboard - 26 Tech',
        admin: req.session.admin,
        apps,
        stats,
        success: req.flash('success'),
        error: req.flash('error'),
      });
    } catch (err) {
      console.error('dashboard error:', err);
      res.status(500).render('error', { message: 'Hitilafu ya seva.' });
    }
  },

  // GET /admin/apps/new
  newAppPage(req, res) {
    res.render('admin/app-form', {
      title: 'Ongeza App - 26 Tech',
      admin: req.session.admin,
      app: null,
      error: req.flash('error'),
    });
  },

  // POST /admin/apps
  async createApp(req, res) {
    try {
      const { name, category, description, version,
              file_size, os, is_free, download_url, is_featured } = req.body;

      if (!name || !category || !description || !download_url) {
        req.flash('error', 'Jaza sehemu zote zinazohitajika.');
        return res.redirect('/admin/apps/new');
      }

      const slug = makeSlug(name);

      await AppModel.create({
        name, slug, category,
        description, version: version || 'v1.0',
        file_size: file_size || '-',
        os: os || 'Windows',
        is_free: is_free === 'true',
        download_url: download_url.trim(), // Hapa sasa itaingia link ya kawaida AU Telegram File ID
        is_featured: is_featured === 'true',
        is_active: true
      });

      req.flash('success', `"${name}" imeongezwa.`);
      res.redirect('/admin');
    } catch (err) {
      console.error('createApp error:', err);
      req.flash('error', err.message.includes('unique') ? 'Jina hili lipo tayari.' : 'Hitilafu ya seva.');
      res.redirect('/admin/apps/new');
    }
  },

  // GET /admin/apps/:id/edit
  async editAppPage(req, res) {
    try {
      const appId = parseInt(req.params.id);
      const app = await AppModel.getById(appId);
      if (!app) { req.flash('error', 'App haikupatikana.'); return res.redirect('/admin'); }
      res.render('admin/app-form', {
        title: `Hariri ${app.name} - 26 Tech`,
        admin: req.session.admin,
        app,
        error: req.flash('error'),
      });
    } catch (err) {
      res.status(500).render('error', { message: 'Hitilafu ya seva.' });
    }
  },

  // POST /admin/apps/:id/edit
  async updateApp(req, res) {
    try {
      const appId = parseInt(req.params.id);
      const { name, category, description, version,
              file_size, os, is_free, download_url, is_featured, is_active } = req.body;
      const slug = makeSlug(name);

      await AppModel.update(appId, {
        name, slug, category,
        description,
        version: version || 'v1.0',
        file_size: file_size || '-',
        os: os || 'Windows',
        is_free: is_free === 'true',
        download_url: download_url.trim(),
        is_featured: is_featured === 'true',
        is_active: is_active === 'true',
      });

      req.flash('success', `"${name}" imehariwiwa.`);
      res.redirect('/admin');
    } catch (err) {
      console.error('updateApp error:', err);
      req.flash('error', 'Hitilafu ya seva.');
      res.redirect(`/admin/apps/${req.params.id}/edit`);
    }
  },

  // POST /admin/apps/:id/delete
  async deleteApp(req, res) {
    try {
      const appId = parseInt(req.params.id);
      const app = await AppModel.getById(appId);
      await AppModel.delete(appId);
      req.flash('success', `"${app?.name}" imefutwa.`);
      res.redirect('/admin');
    } catch (err) {
      console.error('deleteApp error:', err);
      req.flash('error', 'Hitilafu ya seva.');
      res.redirect('/admin');
    }
  },
};

module.exports = AdminController;