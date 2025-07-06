const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Routes utilisateur (nécessitent une authentification)
router.get('/my-notifications', verifyToken, NotificationController.getMyNotifications);
router.get('/my-unread', verifyToken, NotificationController.getMyUnreadNotifications);
router.put('/:id/read', verifyToken, NotificationController.markAsRead);
router.put('/mark-all-read', verifyToken, NotificationController.markAllAsRead);
router.delete('/:id', verifyToken, NotificationController.deleteNotification);

// Routes admin (nécessitent une authentification admin)
router.post('/check-overdue', verifyToken, verifyAdmin, NotificationController.checkOverdueBooks);
router.get('/all', verifyToken, verifyAdmin, NotificationController.getAllNotifications);
router.get('/stats', verifyToken, verifyAdmin, NotificationController.getNotificationStats);
router.post('/test-email', verifyToken, verifyAdmin, NotificationController.testEmailConfig);

module.exports = router;
