const express = require('express');
const BorrowController = require('../controllers/BorrowController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Route publique pour vérifier si un livre est emprunté
router.get('/est-emprunte/:id', BorrowController.isBookBorrowed);

// Routes protégées
router.use(verifyToken);

router.get('/', BorrowController.getMyBorrows);
router.get('/details', BorrowController.getAllBorrowsWithDetails);
router.get('/utilisateur/:id', BorrowController.getBorrowsByUser);
router.get('/utilisateur/:id/non-rendus', BorrowController.getBorrowsByUserNotReturned);
router.get('/rendus', BorrowController.getReturnedBorrows);
router.post('/', BorrowController.createBorrow);
router.put('/retour/:id', BorrowController.returnBook);

module.exports = router;
