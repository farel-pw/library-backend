const express = require('express');
const UserController = require('../controllers/UserController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes utilisateurs nécessitent une authentification
router.use(verifyToken);

// Routes utilisateurs
router.get('/profile', UserController.getCurrentUser);
router.put('/profile', UserController.updateCurrentUser);
router.get('/', verifyAdmin, UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.post('/', verifyAdmin, UserController.createUser);
router.put('/:id', verifyAdmin, UserController.updateUser);
router.patch('/:id/status', verifyAdmin, UserController.toggleUserStatus);
router.delete('/:id', verifyAdmin, UserController.deleteUser);

module.exports = router;
