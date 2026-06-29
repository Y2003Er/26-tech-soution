const express = require('express');
const router = express.Router();
const appController = require('../controllers/appController');

// Ukurasa wa nyumbani (Home Page)
router.get('/', appController.index);

// Ukurasa wa undani wa app (Details Page)
router.get('/details/:slug', appController.details);

module.exports = router;