const AppModel   = require('../models/appModel');
const TokenModel = require('../models/tokenModel');
// Vuta huduma ya Telegram kutoka root
const TelegramService = require('../telegramService'); 

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
      
      // Ongeza idadi ya downloads kwenye database
      await AppModel.incrementDownloads(app.id);

      const urlOrId = app.download_url ? app.download_url.trim() : '';

      // 🕵️‍♂️ UKAGUZI: Je, hii ni Link ya kawaida au ni Telegram File ID?
      if (urlOrId.startsWith('http://') || urlOrId.startsWith('https://')) {
        // Njia ya Kawaida: Mpelee kwenye hiyo link moja kwa moja
        return res.redirect(urlOrId);
      } else if (urlOrId !== '') {
        // Njia ya Telegram: Vuta link halisi ya faili kutoka Telegram kwa kutumia File ID
        try {
          const realTelegramLink = await TelegramService.getTelegramDownloadLink(urlOrId);
          // Mpelee mtumiaji kwenye link ya download ya Telegram iliyotengenezwa haraka
          return res.redirect(realTelegramLink);
        } catch (teleErr) {
          console.error("❌ Hitilafu ya kuvuta faili Telegram:", teleErr.message);
          return res.status(500).render('error', { 
            title: 'Hitilafu ya Shusha', 
            code: '500', 
            message: 'Imeshindwa kuunganishwa na seva ya faili ya Telegram. Jaribu tena baadae.' 
          });
        }
      } else {
        // Hakuna link iliyowekwa
        return res.redirect('/');
      }

    } catch (err) {
      console.error('goDownload error:', err);
      res.redirect('/');
    }
  },
};

module.exports = DownloadController;