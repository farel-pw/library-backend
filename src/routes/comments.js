const express = require('express');
const CommentController = require('../controllers/CommentController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Route publique pour voir les commentaires
router.get('/livre/:id', CommentController.getCommentsByBook);
router.get('/bibliotheque', CommentController.getBibliothequeComments);
router.get('/bibliotheque/stats', CommentController.getBibliothequeStats);

// Routes protégées
router.use(verifyToken);

router.get('/user', CommentController.getMyComments);
router.post('/', CommentController.createComment);
router.post('/bibliotheque', CommentController.createBibliothequeComment);
router.put('/note', CommentController.updateNote);
router.delete('/:id', CommentController.deleteComment);

module.exports = router;
