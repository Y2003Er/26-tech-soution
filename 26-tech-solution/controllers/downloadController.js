const AppModel   = require('../models/appModel');
const TokenModel = require('../models/tokenModel');

const DownloadController = {

  // GET /download/:slug
  async downloadPage(req, res) {
    try {
      const app = await AppModel.getBySlug(req.params.slug);
      if (!app) {
        return res.status(404).render('error', {
          title: '404 - Haipo',
          code: '404',
          message: 'App haikupatikana.',
        });
      }
      res.render('download', { app });
    } catch (err) {
      console.error('downloadPage error:', err);
      res.status(500).render('error', { title: 'Hitilafu', code: '500', message: 'Hitilafu ya seva.' });
    }
  },

  // GET /go/:slug - inaitwa baada ya timer kuisha, inaongeza download count
  async goDownload(req, res) {
    try {
      const app = await AppModel.getBySlug(req.params.slug);
      if (!app) return res.redirect('/');
      AppModel.incrementDownloads(app.id);
      res.redirect(app.download_url);
    } catch (err) {
      console.error('goDownload error:', err);
      res.redirect('/');
    }
  },
};

module.exports = DownloadController;