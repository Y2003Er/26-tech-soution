// ═══════════════════════════════════════════
// 26-TECH ADMIN CONTROLLER
// ═══════════════════════════════════════════

const AppModel = require('../models/appModel');
const AdminModel = require('../models/adminModel');

function makeSlug(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const AdminController = {

  // ── LOGIN ────────────────────────────────────
  loginPage(req, res) {
    if (req.session.admin) return res.redirect('/admin');
    res.render('admin/login', {
      title: 'Admin Login - 26 Tech',
      error: req.flash('error'),
      success: req.flash('success'),
    });
  },

  async loginPost(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        req.flash('error', 'Jaza sehemu zote.');
        return res.redirect('/admin/login');
      }

      const admin = await AdminModel.findByEmail(email);
      if (!admin) {
        req.flash('error', 'Email au nywila si sahihi.');
        return res.redirect('/admin/login');
      }

      const ok = await AdminModel.verifyPassword(password, admin.password);
      if (!ok) {
        req.flash('error', 'Email au nywila si sahihi.');
        return res.redirect('/admin/login');
      }

      req.session.admin = { id: admin.id, email: admin.email, username: admin.username };

      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          req.flash('error', 'Hitilafu ya seva.');
          return res.redirect('/admin/login');
        }
        res.redirect('/admin');
      });

    } catch (err) {
      console.error('login error:', err);
      req.flash('error', 'Hitilafu ya seva.');
      res.redirect('/admin/login');
    }
  },

  // ── LOGOUT ───────────────────────────────────
  logout(req, res) {
    req.session.destroy(() => res.redirect('/admin/login'));
  },

  // ── DASHBOARD ────────────────────────────────
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
      res.status(500).render('error', { title: 'Hitilafu', code: '500', message: 'Hitilafu ya seva.' });
    }
  },

  // ── NEW APP ──────────────────────────────────
  newAppPage(req, res) {
    res.render('admin/app-form', {
      title: 'Ongeza App - 26 Tech',
      admin: req.session.admin,
      app: null,
      error: req.flash('error'),
    });
  },

  async createApp(req, res) {
    try {
      const { name, category, description, version,
              file_size, os, is_free, download_url, is_featured, icon_file_id: manualIconFileId } = req.body;

      if (!name || !category || !description || !download_url) {
        req.flash('error', 'Jaza sehemu zote zinazohitajika.');
        return res.redirect('/admin/apps/new');
      }

      const slug = makeSlug(name);

      // ============================================
      // ICON FILE ID - Inachukuliwa kutoka upload
      // ============================================
      const icon_file_id = req.fileId || (manualIconFileId && manualIconFileId.trim()) || null;

      await AppModel.create({
        name, slug, category,
        description, version: version || 'v1.0',
        file_size: file_size || '-',
        os: os || 'Windows',
        is_free: is_free === 'true',
        download_url: download_url.trim(),
        is_featured: is_featured === 'true',
        is_active: true,
        icon_file_id: icon_file_id
      });

      req.flash('success', `"${name}" imeongezwa.`);
      res.redirect('/admin');
    } catch (err) {
      console.error('createApp error:', err);
      req.flash('error', err.message.includes('unique') ? 'Jina hili lipo tayari.' : 'Hitilafu ya seva.');
      res.redirect('/admin/apps/new');
    }
  },

  // ── EDIT APP ─────────────────────────────────
  async editAppPage(req, res) {
    try {
      const appId = parseInt(req.params.id);
      const app = await AppModel.getById(appId);
      if (!app) {
        req.flash('error', 'App haikupatikana.');
        return res.redirect('/admin');
      }
      res.render('admin/app-form', {
        title: `Hariri ${app.name} - 26 Tech`,
        admin: req.session.admin,
        app,
        error: req.flash('error'),
      });
    } catch (err) {
      res.status(500).render('error', { title: 'Hitilafu', code: '500', message: 'Hitilafu ya seva.' });
    }
  },

  async updateApp(req, res) {
    try {
      const appId = parseInt(req.params.id);
      const { name, category, description, version,
              file_size, os, is_free, download_url, is_featured, is_active, icon_file_id: manualIconFileId } = req.body;
      const slug = makeSlug(name);

      // ============================================
      // ICON FILE ID - Inachukuliwa kutoka upload
      // ============================================
      const icon_file_id = req.fileId || (manualIconFileId && manualIconFileId.trim()) || null;

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
        icon_file_id: icon_file_id
      });

      req.flash('success', `"${name}" imehaririwa.`);
      res.redirect('/admin');
    } catch (err) {
      console.error('updateApp error:', err);
      req.flash('error', 'Hitilafu ya seva.');
      res.redirect(`/admin/apps/${req.params.id}/edit`);
    }
  },

  // ── DELETE APP ──────────────────────────────
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