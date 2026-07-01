// ═══════════════════════════════════════════
// 26-TECH APP CONTROLLER (FULL VERSION)
// ═══════════════════════════════════════════

const AppModel = require('../models/appModel');

const PAGE_SIZE = 20;

const appController = {
  // 1. Ukurasa wa Nyumbani
  async index(req, res) {
    try {
      const currentCategory = req.query.cat || 'Zote';
      const searchQuery = req.query.q || '';
      const platform = req.query.platform || 'All';
      const sort = req.query.sort || 'trending';
      const currentPage = Math.max(1, parseInt(req.query.page, 10) || 1);
      const offset = (currentPage - 1) * PAGE_SIZE;

      const [apps, categories, totalApps, sections] = await Promise.all([
        AppModel.getAll({ category: currentCategory, search: searchQuery, platform, sort, limit: PAGE_SIZE, offset }),
        AppModel.getCategoriesWithPreviews(4),
        AppModel.count({ category: currentCategory, search: searchQuery, platform }),
        AppModel.getHomeSections()
      ]);

      const totalPages = Math.max(1, Math.ceil(totalApps / PAGE_SIZE));

      res.render('index', {
        title: '26 TECH — Software Hub',
        apps,
        categories,
        total: totalApps,
        currentCat: currentCategory,
        query: searchQuery,
        platform,
        sort,
        sections,
        currentPage,
        totalPages
      });
    } catch (err) {
      console.error('index error:', err);
      res.status(500).render('error', {
        title: 'Hitilafu ya Seva — 26 TECH',
        code: '500',
        message: 'Imeshindwa kuvuta data kutoka kwenye hifadhi.'
      });
    }
  },

  // 1b. Ukurasa wa Categories zote
  async categoriesPage(req, res) {
    try {
      const categories = await AppModel.getCategoriesWithPreviews(4);
      res.render('categories', {
        title: 'Categories — 26 TECH',
        categories
      });
    } catch (err) {
      console.error('categoriesPage error:', err);
      res.status(500).render('error', {
        title: 'Hitilafu ya Seva — 26 TECH',
        code: '500',
        message: 'Imeshindwa kuvuta data kutoka kwenye hifadhi.'
      });
    }
  },

  // 1c. Ukurasa wa Category moja (grid kamili ya apps za category moja)
  async categoryPage(req, res) {
    try {
      const categoryName = decodeURIComponent(req.params.name);
      const sort = req.query.sort || 'trending';
      const currentPage = Math.max(1, parseInt(req.query.page, 10) || 1);
      const offset = (currentPage - 1) * PAGE_SIZE;

      const [apps, totalApps] = await Promise.all([
        AppModel.getAll({ category: categoryName, sort, limit: PAGE_SIZE, offset }),
        AppModel.count({ category: categoryName })
      ]);

      const totalPages = Math.max(1, Math.ceil(totalApps / PAGE_SIZE));

      res.render('category', {
        title: `${categoryName} — 26 TECH`,
        categoryName,
        apps,
        total: totalApps,
        sort,
        currentPage,
        totalPages
      });
    } catch (err) {
      console.error('categoryPage error:', err);
      res.status(500).render('error', {
        title: 'Hitilafu ya Seva — 26 TECH',
        code: '500',
        message: 'Imeshindwa kuvuta data kutoka kwenye hifadhi.'
      });
    }
  },

  // 2. Ukurasa wa Undani wa App
  async details(req, res) {
    const { slug } = req.params;
    try {
      const app = await AppModel.getBySlug(slug);
      if (!app) {
        return res.status(404).render('error', {
          title: 'Haikupatikana — 26 TECH',
          code: '404',
          message: 'Programu unayotafuta haipo.'
        });
      }
      await AppModel.incrementViews(app.id);
      const related = await AppModel.getRelated(app.id, app.category, 4);

      res.render('details', {
        title: `${app.name} — 26 TECH`,
        app,
        related
      });
    } catch (err) {
      console.error('details error:', err);
      res.status(500).render('error', {
        title: 'Hitilafu ya Seva — 26 TECH',
        code: '500',
        message: 'Kuna tatizo limejitokeza.'
      });
    }
  },

  // 3. Kurasa za Footer
  about(req, res) { res.render('about'); },
  contact(req, res) { res.render('contact'); },
  dmca(req, res) { res.render('dmca'); },
  privacy(req, res) { res.render('privacy'); }
};

module.exports = appController;