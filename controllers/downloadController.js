const AppModel = require('../models/appModel');
const TokenModel = require('../models/tokenModel');
const TelegramService = require('../services/telegramService');

// Content for the "Download FAQs" accordion on the download page.
// Kept here (data layer) instead of hardcoded in the .ejs view so it can be
// edited/extended — or later swapped for a DB-backed table — without
// touching any markup or styles.
const DOWNLOAD_FAQS = [
  { q: 'What is APK INSTALLER? How to install?', a: 'An APK installer is just the Android package file itself. Download it, open your file manager, tap the .apk file, and choose "Install". If prompted, allow installs from this source in your settings.' },
  { q: 'What is XAPK? How to install?', a: 'XAPK bundles the APK together with extra data (OBB) files. Use an XAPK installer app to open it directly, or extract it manually and place the OBB folder in Android/obb/.' },
  { q: 'The download link is broken!', a: 'Links can expire or fail temporarily. Go back and generate a fresh download link — if it still fails after a few tries, please use the Report link in the footer so we can fix it.' },
  { q: 'What causes mods not to work properly?', a: 'Mods can break after the original app updates its server-side checks, or if you already have the official version installed. Uninstall the official version first, then install the mod fresh.' },
  { q: 'How to fix "App not installed" error?', a: 'This usually means a signature mismatch with an existing install, insufficient storage, or a corrupted download. Uninstall any existing version, clear some storage space, and re-download the file.' },
  { q: 'How to update mods without losing data?', a: 'Only install an update over an existing mod if both versions share the same package signature. When in doubt, back up your save data first using the app in-game cloud/export option before updating.' },
];

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
      res.render('download', { app, related, downloadFaqs: DOWNLOAD_FAQS });
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