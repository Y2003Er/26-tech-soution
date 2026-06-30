const AppModel = require('../models/appModel');
const TelegramService = require('../services/telegramService');

const DownloadController = {

  // Inaonyesha ukurasa wa maandalizi ya kupakua (Download Page)
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

  // Inapakua faili lenyewe (Inaitwa mwishoni mtumiaji akibonyeza download)
  async goDownload(req, res) {
    try {
      const app = await AppModel.getBySlug(req.params.slug);
      if (!app) {
        return res.redirect('/');
      }

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
      console.error('goDownload Error:', err);
      return res.redirect('/');
    }
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