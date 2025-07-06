const express = require('express');
const ReservationController = require('../controllers/ReservationController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Routes publiques (aucune pour les réservations)

// Toutes les routes nécessitent une authentification
router.use(verifyToken);

// Routes utilisateur
router.get('/', ReservationController.getMyReservations);
router.post('/', ReservationController.createReservation);
router.delete('/:id', ReservationController.deleteReservation);

// Routes admin (nécessitent des privilèges admin)
router.get('/all', verifyAdmin, ReservationController.getAllReservations);
router.get('/details', verifyAdmin, ReservationController.getAllReservationsWithDetails);
router.get('/livre', ReservationController.getReservationsByBook);
router.get('/utilisateur/:id', ReservationController.getReservationsByUser);
router.put('/:id', verifyAdmin, ReservationController.updateReservation);
router.put('/:id/approve', verifyAdmin, ReservationController.approveReservation);
router.put('/:id/reject', verifyAdmin, ReservationController.rejectReservation);

module.exports = router;
