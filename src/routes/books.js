const express = require('express');
const BookController = require('../controllers/BookController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Route publique pour voir les livres
router.get('/', BookController.getAllBooks);
router.get('/:id', BookController.getBookById);

// Routes protégées (admin uniquement)
router.post('/', verifyToken, verifyAdmin, BookController.createBook);
router.put('/:id', verifyToken, verifyAdmin, BookController.updateBook);
router.delete('/:id', verifyToken, verifyAdmin, BookController.deleteBook);

module.exports = router;
