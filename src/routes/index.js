const express = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./users');
const bookRoutes = require('./books');
const borrowRoutes = require('./borrows');
const reservationRoutes = require('./reservations');
const commentRoutes = require('./comments');
const analyticsRoutes = require('./analytics');
const notificationRoutes = require('./notifications');

const router = express.Router();

// Routes principales
router.use('/', authRoutes);
router.use('/utilisateurs', userRoutes);
router.use('/livres', bookRoutes);
router.use('/emprunts', borrowRoutes);
router.use('/reservations', reservationRoutes);
router.use('/commentaires', commentRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
