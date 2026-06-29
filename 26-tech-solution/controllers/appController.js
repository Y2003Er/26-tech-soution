const AppModel   = require('../models/appModel');
const TokenModel = require('../models/tokenModel');

const AppController = {

  // GET / — Ukurasa mkuu
  async index(req, res) {
    try {
      const { cat = 'Zote', q = '', page = 1 } = req.query;
      const limit  = 12;
      const offset = (parseInt(page) - 1) * limit;

      const [apps, categories, total] = await Promise.all([
        AppModel.getAll({ category: cat, search: q, limit, offset }),
        AppModel.getCategories(),
        AppModel.count({ category: cat, search: q }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.render('index', {
        apps,
        categories,
        total,
        totalPages,
        currentPage: parseInt(page),
        currentCat: cat,
        query: q,
        title: '26 Tech Solution — Software Hub',
      });
    } catch (err) {
      console.error('❌ index error:', err);
      res.status(500).render('error', { message: 'Hitilafu ya seva. Jaribu tena.' });
    }
  },

  // GET /app/:slug — Ukurasa wa maelezo
  async details(req, res) {
    try {
      const app = await AppModel.getBySlug(req.params.slug);
      if (!app) return res.status(404).render('error', { message: 'App haikupatikana.' });

      // Ongeza view count (background — usisimamisha ukurasa)
      AppModel.incrementViews(app.id).catch(() => {});

      const related = await AppModel.getRelated(app.id, app.category);

      res.render('details', {
        app,
        related,
        title: `${app.name} — 26 Tech Solution`,
      });
    } catch (err) {
      console.error('❌ details error:', err);
      res.status(500).render('error', { message: 'Hitilafu ya seva.' });
    }
  },
};

module.exports = AppController;
