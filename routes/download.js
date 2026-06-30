const express = require('express');
const router = express.Router();
const DownloadController = require('../controllers/downloadController');

router.get('/download/:slug', DownloadController.downloadPage);
router.post('/download/:slug/prepare', DownloadController.prepareDownload);

router.get('/go/:slug/:token', DownloadController.serveDownload);
router.get('/go/:slug', DownloadController.legacyRedirect);

router.get('/icon/:fileId', DownloadController.getIcon);

module.exports = router;