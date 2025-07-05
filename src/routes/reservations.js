const express = require('express');
const ReservationController = require('../controllers/ReservationController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(verifyToken);

router.get('/livre', ReservationController.getReservationsByBook);
router.get('/utilisateur/:id', ReservationController.getReservationsByUser);
router.post('/', ReservationController.createReservation);
router.delete('/:id', ReservationController.deleteReservation);

module.exports = router;
