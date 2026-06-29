// ═══════════════════════════════════════════
// 26-TECH APP CONTROLLER (LITEAPKS FULL FIXED)
// ═══════════════════════════════════════════

const AppModel = require('../models/appModel');

const appController = {
  // 1. Ukurasa wa Nyumbani (Home Page na Filters)
  async index(req, res) {
    try {
      const currentCategory = req.query.category || 'Zote';
      const searchQuery = req.query.search || '';

      // Kuvuta data kwa pamoja kulingana na kategoria na search query
      const [apps, categories, totalApps] = await Promise.all([
        AppModel.getAll({ category: currentCategory, search: searchQuery }),
        AppModel.getCategories(),
        AppModel.count({ category: currentCategory, search: searchQuery })
      ]);

      // Tuma data zote kwenye index.ejs
      res.render('index', { 
        title: 'LITEAPKS — #1 MOD APK for Android',
        apps: apps, 
        categories: categories, 
        totalApps: totalApps,
        currentCategory: currentCategory,
        searchQuery: searchQuery
      });

    } catch (err) {
      console.error('❌ index error:', err);
      res.status(500).render('error', { 
        title: 'Hitilafu ya Seva',
        code: '500', 
        message: 'Imeshindwa kuvuta data kutoka kwenye hifadhi ya Supabase.' 
      });
    }
  },

  // 2. Ukurasa wa Undani wa App (Details Page)
  async details(req, res) {
    const { slug } = req.params;
    try {
      const app = await AppModel.getBySlug(slug);
      
      if (!app) {
        return res.status(404).render('error', { 
          title: 'Haikupatikana',
          code: '404', 
          message: 'Programu unayotafuta haipo kwenye seva yetu.' 
        });
      }

      // Ongeza view count kiotomatiki mtumiaji akifungua
      await AppModel.incrementViews(app.id);

      res.render('details', { 
        title: `${app.name} — LiteAPKs Mode`,
        app: app 
      });

    } catch (err) {
      console.error('❌ details error:', err);
      res.status(500).render('error', { 
        title: 'Hitilafu ya Seva',
        code: '500', 
        message: 'Kuna tatizo limejitokeza wakati wa kufungua ukurasa huu.' 
      });
    }
  }
};

module.exports = appController;