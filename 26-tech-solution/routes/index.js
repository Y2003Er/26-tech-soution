const express       = require('express');
const router        = express.Router();
const AppController = require('../controllers/appController');

router.get('/',           AppController.index);
router.get('/app/:slug',  AppController.details);

module.exports = router;
