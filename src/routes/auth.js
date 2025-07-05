const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

// Routes publiques d'authentification
router.get('/', AuthController.welcome);
router.post('/signup', AuthController.register);
router.post('/userlogin', AuthController.login);

module.exports = router;
