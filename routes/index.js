const express = require('express');
const router = express.Router();
const appController = require('../controllers/appController');
const NewsletterController = require('../controllers/newsletterController');

// Ukurasa wa nyumbani (Home Page)
router.get('/', appController.index);

// Ukurasa wa category (grid kamili ya apps za category moja)
router.get('/category/:name', appController.categoryPage);

// Ukurasa wa undani wa app (Details Page)
router.get('/app/:slug', appController.details);

// Newsletter
router.post('/newsletter/subscribe', NewsletterController.subscribe);

// Kurasa za kisheria na mawasiliano (Footer Pages)
router.get('/about', appController.about);
router.get('/contact', appController.contact);
router.get('/dmca', appController.dmca);
router.get('/privacy', appController.privacy);

module.exports = router;