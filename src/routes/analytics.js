const express = require('express');
const AnalyticsController = require('../controllers/AnalyticsController');

const router = express.Router();

// Routes analytics (temporairement sans auth pour debug)
router.get('/dashboard', AnalyticsController.getDashboardStats);
router.get('/livres', AnalyticsController.getBooksAnalytics);
router.get('/utilisateurs', AnalyticsController.getUsersAnalytics);
router.get('/emprunts', AnalyticsController.getBorrowsAnalytics);
router.get('/top-livres', AnalyticsController.getTopBooks);
router.get('/utilisateurs-actifs', AnalyticsController.getActiveUsers);
router.get('/tendances-mensuelles', AnalyticsController.getMonthlyTrends);
router.get('/stats-genres', AnalyticsController.getGenreStats);

module.exports = router;
