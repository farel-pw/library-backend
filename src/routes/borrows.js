const express = require('express');
const BorrowController = require('../controllers/BorrowController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Route publique pour vérifier si un livre est emprunté
router.get('/est-emprunte/:id', BorrowController.isBookBorrowed);

// Routes protégées
router.use(verifyToken);

// Routes utilisateur
router.get('/', BorrowController.getMyBorrows);
router.post('/', BorrowController.createBorrow);
router.post('/reserver', BorrowController.createReservation);
router.put('/retour/:id', BorrowController.returnBook);

// Route pour mettre à jour les statuts
router.post('/update-statuses', BorrowController.updateBorrowStatuses);

// Routes admin (nécessitent des privilèges admin)
router.get('/all', verifyAdmin, BorrowController.getAllBorrows);
router.get('/details', verifyAdmin, BorrowController.getAllBorrowsWithDetails);
router.get('/utilisateur/:id', BorrowController.getBorrowsByUser);
router.get('/utilisateur/:id/non-rendus', BorrowController.getBorrowsByUserNotReturned);
router.get('/rendus', BorrowController.getReturnedBorrows);
router.get('/:id', BorrowController.getBorrowById);
router.put('/:id', verifyAdmin, BorrowController.updateBorrow);
router.put('/:id/return', verifyAdmin, BorrowController.adminReturnBook);
router.put('/:id/extend', verifyAdmin, BorrowController.extendBorrow);

module.exports = router;
