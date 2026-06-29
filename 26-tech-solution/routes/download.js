const express            = require('express');
const router             = express.Router();
const DownloadController = require('../controllers/downloadController');
const rateLimit          = require('express-rate-limit');

// Zuia abuse — download requests max 10/dakika kwa IP
const dlLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Umefanya maombi mengi sana. Jaribu baada ya dakika moja.',
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/download/:slug', dlLimit, DownloadController.waitPage);
router.get('/go/:token',      dlLimit, DownloadController.redirect);

module.exports = router;
