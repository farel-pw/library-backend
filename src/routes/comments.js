const express = require('express');
const CommentController = require('../controllers/CommentController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Routes publiques
router.get('/livre/:id', CommentController.getCommentsByBook);
router.get('/bibliotheque', CommentController.getBibliothequeComments);
router.get('/bibliotheque/stats', CommentController.getBibliothequeStats);

// Route de test pour debug (temporaire)
router.get('/test-all', CommentController.getAllCommentsWithDetails);

// Routes protégées (utilisateur connecté)
router.use(verifyToken);

// Routes utilisateur
router.get('/user', CommentController.getMyComments);
router.post('/', CommentController.createComment);
router.post('/bibliotheque', CommentController.createBibliothequeComment);
router.put('/note', CommentController.updateNote);
router.delete('/:id', CommentController.deleteComment);

// Routes admin (nécessitent des privilèges admin)
router.get('/all', verifyAdmin, CommentController.getAllComments);
router.get('/details', verifyAdmin, CommentController.getAllCommentsWithDetails);
router.get('/stats', verifyAdmin, CommentController.getCommentsStats);
router.get('/moderation', verifyAdmin, CommentController.getCommentsForModeration);
router.put('/:id', verifyAdmin, CommentController.updateComment);
router.put('/:id/approve', verifyAdmin, CommentController.approveComment);
router.put('/:id/reject', verifyAdmin, CommentController.rejectComment);
router.delete('/admin/:id', verifyAdmin, CommentController.adminDeleteComment);

module.exports = router;
