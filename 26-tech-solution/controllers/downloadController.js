const AppModel   = require('../models/appModel');
const TokenModel = require('../models/tokenModel');

const DownloadController = {

  // GET /download/:slug — Ukurasa wa kusubiri (timer 10s)
  async waitPage(req, res) {
    try {
      const app = await AppModel.getBySlug(req.params.slug);
      if (!app) return res.status(404).render('error', { message: 'App haikupatikana.' });

      // Tengeneza token ya siri
      const token = await TokenModel.create(app.id);

      res.render('download', {
        app,
        token,
        timerSeconds: 10,
        title: `Pakua ${app.name} — 26 Tech Solution`,
      });
    } catch (err) {
      console.error('❌ waitPage error:', err);
      res.status(500).render('error', { message: 'Hitilafu ya seva.' });
    }
  },

  // GET /go/:token — Redirect ya mwisho kwenye download link
  async redirect(req, res) {
    try {
      const record = await TokenModel.verify(req.params.token);

      if (!record) {
        return res.status(410).render('error', {
          message: 'Link hii imekwisha muda au imetumika tayari. Rudi na ujaribu tena.',
        });
      }

      // Weka token kama imetumika + ongeza downloads
      await Promise.all([
        TokenModel.markUsed(req.params.token),
        AppModel.incrementDownloads(record.app_id),
      ]);

      // Redirect kwenye download URL ya kweli
      res.redirect(record.download_url);
    } catch (err) {
      console.error('❌ redirect error:', err);
      res.status(500).render('error', { message: 'Hitilafu ya seva.' });
    }
  },
};

module.exports = DownloadController;
