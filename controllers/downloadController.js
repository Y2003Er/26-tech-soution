const AppModel = require('../models/appModel');
const TelegramService = require('../telegramService'); 

const DownloadController = {

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

  async goDownload(req, res) {
    console.log(`⚡ [SERVER]: Request imepokelewa kwa slug: ${req.params.slug}`);

    try {
      const app = await AppModel.getBySlug(req.params.slug);
      if (!app) {
        console.log("❌ [SERVER]: App haikupatikana kwenye DB");
        return res.redirect('/');
      }

      await AppModel.incrementDownloads(app.id);

      const urlOrId = app.download_url ? app.download_url.trim() : '';

      // 1. Link ya kawaida (http)
      if (urlOrId.startsWith('http')) {
        console.log("🔗 [SERVER]: Redirect ya kawaida...");
        return res.redirect(urlOrId);
      }

      // 2. Telegram File ID — stream kupitia server yetu
      else if (urlOrId !== '') {
        console.log(`☁️ [SERVER]: Inastream faili kutoka Telegram kwa ID: ${urlOrId}`);
        try {
          // Pitisha app.name ili file ishuke kwa jina sahihi
          await TelegramService.streamTelegramFile(urlOrId, res, app.name);
        } catch (teleErr) {
          console.error("❌ [SERVER]: Telegram Error:", teleErr.message);
          return res.status(500).render('error', { 
            title: 'Hitilafu ya Server', 
            code: '500', 
            message: 'Faili halipatikani kwenye seva ya Telegram.' 
          });
        }
      }

      // 3. Hakuna link
      else {
        console.log("⚠️ [SERVER]: App haina download link.");
        return res.redirect('/');
      }

    } catch (err) {
      console.error('❌ [SERVER]: goDownload Error:', err);
      return res.redirect('/');
    }
  },
};

module.exports = DownloadController;