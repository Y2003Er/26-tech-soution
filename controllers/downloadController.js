const AppModel = require('../models/appModel');
const TelegramService = require('../telegramService'); 

const DownloadController = {

  // HATUA YA 1 & 2: Inaonyesha ukurasa wa maandalizi ya kupakua (Download Page)
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
      
      // Tunatuma data ya app kwenda kwenye view ya 'download'
      // Hapa ndipo mtumiaji atakapoona ule mtiririko wa LiteAPKs
      res.render('download', { app });
    } catch (err) {
      console.error('downloadPage error:', err);
      res.status(500).render('error', { title: 'Hitilafu', code: '500', message: 'Hitilafu ya seva.' });
    }
  },

  // HATUA YA 3: Hii sasa itaitwa "Silent" kwa kutumia JavaScript (fetch) kutoka kwenye EJS layout
  // Ili kutengeneza link kimya kimya bila ku-refresh peji nzima mapema
  async generateLink(req, res) {
    console.log(`⚡ [SERVER]: Inatengeneza link ya kimya kimya kwa slug: ${req.params.slug}`);
    try {
      const app = await AppModel.getBySlug(req.params.slug);
      if (!app) {
        return res.status(404).json({ success: false, message: 'App haikupatikana' });
      }

      const urlOrId = app.download_url ? app.download_url.trim() : '';
      
      // Hapa tunatengeneza jibu la JSON kwenda kwenye EJS badala ya ku-redirect mazima
      if (urlOrId !== '') {
        return res.json({
          success: true,
          // Kama ni ID ya Telegram tunaweka endpoint yake, kama ni HTTP link tunaweka yenyewe
          downloadUrl: urlOrId.startsWith('http') ? urlOrId : `/download/${app.slug}/file`,
          size: app.size || 'Unknown Size' // Hakikisha DB yako ina uwanja wa size, au weka default
        });
      } else {
        return res.status(400).json({ success: false, message: 'App haina link ya kupakua.' });
      }
    } catch (err) {
      console.error('❌ [SERVER]: generateLink Error:', err);
      return res.status(500).json({ success: false, message: 'Hitilafu ya seva.' });
    }
  },

  // HII NDIO INAYOMALIZA KAZI: Inapakua faili lenyewe (Inaitwa mwishoni kabisa mtumiaji akibonyeza download ya mwisho)
  async goDownload(req, res) {
    console.log(`⚡ [SERVER]: Upakuaji wa mwisho umeanza kwa slug: ${req.params.slug}`);

    try {
      const app = await AppModel.getBySlug(req.params.slug);
      if (!app) {
        console.log("❌ [SERVER]: App haikupatikana kwenye DB");
        return res.redirect('/');
      }

      await AppModel.incrementDownloads(app.id);
      const urlOrId = app.download_url ? app.download_url.trim() : '';

      if (urlOrId.startsWith('http')) {
        console.log("🔗 [SERVER]: Redirect kwenda link ya nje...");
        return res.redirect(urlOrId);
      }

      else if (urlOrId !== '') {
        console.log(`☁️ [SERVER]: Inastream faili kutoka Telegram kwa ID: ${urlOrId}`);
        try {
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

      else {
        console.log("⚠️ [SERVER]: App haina download link.");
        return res.redirect('/');
      }

    } catch (err) {
      console.error('❌ [SERVER]: goDownload Error:', err);
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
