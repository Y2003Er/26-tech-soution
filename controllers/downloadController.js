const AppModel = require('../models/appModel');
const TokenModel = require('../models/tokenModel');
const TelegramService = require('../services/telegramService');

const DownloadController = {

  // GET /download/:slug — Ukurasa wa kuandaa download
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
      const related = await AppModel.getRandomApps(app.id, 3);
      res.render('download', { app, related });
    } catch (err) {
      console.error('downloadPage error:', err);
      res.status(500).render('error', { title: 'Hitilafu', code: '500', message: 'Hitilafu ya seva.' });
    }
  },

  // POST /download/:slug/prepare — Inazalisha token HALISI ya download (DB-backed)
  async prepareDownload(req, res) {
    try {
      const app = await AppModel.getBySlug(req.params.slug);
      if (!app) {
        return res.status(404).json({ success: false, message: 'App haikupatikana.' });
      }

      const token = await TokenModel.create(app.id);
      const waitSeconds = parseInt(process.env.DOWNLOAD_WAIT_SECONDS) || 5;

      return res.json({
        success: true,
        token,
        waitSeconds,
        downloadUrl: `/go/${app.slug}/${token}`,
      });
    } catch (err) {
      console.error('prepareDownload error:', err);
      return res.status(500).json({ success: false, message: 'Hitilafu ya seva, jaribu tena.' });
    }
  },

  // GET /go/:slug/:token — Inathibitisha token kisha inatoa faili halisi
  async serveDownload(req, res) {
    try {
      const { slug, token } = req.params;
      const tokenRow = await TokenModel.verify(token);

      if (!tokenRow) {
        return res.status(410).render('error', {
          title: 'Link Imeisha Muda',
          code: '410',
          message: 'Download link hii imeisha muda au tayari imetumika. Rudi nyuma utengeneze link mpya.',
        });
      }

      const app = await AppModel.getBySlug(slug);
      if (!app || app.id !== tokenRow.app_id) {
        return res.status(400).render('error', {
          title: 'Link Batili',
          code: '400',
          message: 'Download link hii si sahihi kwa programu hii.',
        });
      }

      await TokenModel.markUsed(token);
      await AppModel.incrementDownloads(app.id);

      const urlOrId = app.download_url ? app.download_url.trim() : '';

      if (urlOrId.startsWith('http')) {
        return res.redirect(urlOrId);
      }

      if (urlOrId !== '') {
        try {
          await TelegramService.streamTelegramFile(urlOrId, res, app.name);
        } catch (teleErr) {
          console.error('Telegram Error:', teleErr.message);
          return res.status(500).render('error', {
            title: 'Hitilafu ya Server',
            code: '500',
            message: 'Faili halipatikani kwenye seva ya Telegram.'
          });
        }
        return;
      }

      return res.redirect('/');
    } catch (err) {
      console.error('serveDownload Error:', err);
      return res.redirect('/');
    }
  },

  // GET /go/:slug — Link za zamani (bila token) zinaelekezwa kuzalisha mpya
  legacyRedirect(req, res) {
    return res.redirect(`/download/${req.params.slug}`);
  },

  // GET /icon/:fileId
  async getIcon(req, res) {
    try {
      const { fileId } = req.params;
      await TelegramService.streamTelegramIcon(fileId, res);
    } catch (err) {
      console.error('getIcon error:', err);
      res.status(404).end();
    }
  },
};

module.exports = DownloadController;