const express = require('express');
const router = express.Router();
const DownloadController = require('../controllers/downloadController');

router.get('/download/:slug', DownloadController.downloadPage);
router.get('/go/:slug', DownloadController.goDownload);
router.get('/icon/:fileId', DownloadController.getIcon);

module.exports = router;