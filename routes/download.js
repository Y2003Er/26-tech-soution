const express = require('express');
const router = express.Router();
const DownloadController = require('../controllers/downloadController');

router.get('/download/:slug', DownloadController.downloadPage);
router.get('/go/:slug', DownloadController.goDownload);

module.exports = router;