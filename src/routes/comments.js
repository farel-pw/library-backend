const express = require('express');
const CommentController = require('../controllers/CommentController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Route publique pour voir les commentaires
router.get('/livre/:id', CommentController.getCommentsByBook);

// Routes protégées
router.use(verifyToken);

router.post('/', CommentController.createComment);
router.put('/note', CommentController.updateNote);
router.delete('/:id', CommentController.deleteComment);

module.exports = router;
