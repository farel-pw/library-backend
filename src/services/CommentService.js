const Comment = require('../models/Comment');

class CommentService {
  static async getCommentsByBook(bookId) {
    try {
      const comments = await Comment.findByBookId(bookId);
      return { error: false, data: comments };
    } catch (error) {
      console.error('Erreur lors de la récupération des commentaires:', error);
      return { error: true, message: "Error fetching comments" };
    }
  }

  static async createComment(commentData) {
    try {
      const newComment = {
        utilisateur_id: commentData.utilisateur_id,
        livre_id: commentData.livre_id,
        commentaire: commentData.commentaire,
        note: commentData.note || null,
        date_commentaire: new Date()
      };

      const result = await Comment.create(newComment);
      return { error: false, message: "Commentaire créé avec succès", id: result.insertId };
    } catch (error) {
      console.error('Erreur lors de la création du commentaire:', error);
      return { error: true, message: "Error creating comment" };
    }
  }

  static async updateNote(noteData) {
    try {
      const result = await Comment.updateNote(noteData);
      if (result.affectedRows === 0) {
        return { error: true, message: "Commentaire non trouvé" };
      }
      return { error: false, message: "Note mise à jour avec succès" };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la note:', error);
      return { error: true, message: "Error updating note" };
    }
  }

  static async deleteComment(id) {
    try {
      const result = await Comment.delete(id);
      if (result.affectedRows === 0) {
        return { error: true, message: "Commentaire non trouvé" };
      }
      return { error: false, message: "Commentaire supprimé avec succès" };
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
      return { error: true, message: "Error deleting comment" };
    }
  }

  static async getBibliothequeComments() {
    try {
      const comments = await Comment.findBibliothequeComments();
      return { error: false, data: comments };
    } catch (error) {
      console.error('Erreur lors de la récupération des commentaires de la bibliothèque:', error);
      return { error: true, message: "Error fetching bibliotheque comments" };
    }
  }

  static async createBibliothequeComment(commentData) {
    try {
      const newComment = {
        utilisateur_id: commentData.utilisateur_id,
        commentaire: commentData.commentaire,
        note: commentData.note || null,
        date_commentaire: new Date()
      };

      const result = await Comment.createBibliothequeComment(newComment);
      return { error: false, message: "Commentaire sur la bibliothèque créé avec succès", id: result.insertId };
    } catch (error) {
      console.error('Erreur lors de la création du commentaire sur la bibliothèque:', error);
      return { error: true, message: "Error creating bibliotheque comment" };
    }
  }

  static async getBibliothequeStats() {
    try {
      const stats = await Comment.getBibliothequeStats();
      return { error: false, data: stats };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de la bibliothèque:', error);
      return { error: true, message: "Error fetching bibliotheque stats" };
    }
  }

  static async getCommentsByUser(userId) {
    try {
      const comments = await Comment.findByUserId(userId);
      return { error: false, data: comments };
    } catch (error) {
      console.error('Erreur lors de la récupération des commentaires par utilisateur:', error);
      return { error: true, message: "Error fetching user comments" };
    }
  }

  static async getAllComments() {
    try {
      console.log("📚 CommentService: Starting getAllComments");
      const comments = await Comment.findAll();
      console.log("📚 CommentService: Comments retrieved successfully, count:", comments.length);
      return { error: false, data: comments };
    } catch (error) {
      console.error('📚 CommentService Error:', error);
      console.error('📚 CommentService Error Stack:', error.stack);
      return { error: true, message: "Error fetching comments" };
    }
  }

  static async getAllCommentsWithDetails() {
    try {
      console.log("📚 CommentService: Starting getAllCommentsWithDetails");
      const comments = await Comment.findAllWithDetails();
      console.log("📚 CommentService: Comments with details retrieved successfully, count:", comments.length);
      return { error: false, data: comments };
    } catch (error) {
      console.error('📚 CommentService Error:', error);
      console.error('📚 CommentService Error Stack:', error.stack);
      return { error: true, message: "Error fetching comments with details" };
    }
  }

  static async getCommentsStats() {
    try {
      const stats = await Comment.getStats();
      return { error: false, data: stats };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return { error: true, message: "Error fetching comments stats" };
    }
  }

  static async getCommentsForModeration() {
    try {
      const comments = await Comment.findForModeration();
      return { error: false, data: comments };
    } catch (error) {
      console.error('Erreur lors de la récupération des commentaires à modérer:', error);
      return { error: true, message: "Error fetching comments for moderation" };
    }
  }

  static async updateComment(id, updateData) {
    try {
      const result = await Comment.update(id, updateData);
      if (result.affectedRows === 0) {
        return { error: true, message: "Commentaire non trouvé" };
      }
      return { error: false, message: "Commentaire mis à jour avec succès" };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du commentaire:', error);
      return { error: true, message: "Error updating comment" };
    }
  }

  static async approveComment(id) {
    try {
      const updateData = {
        statut: 'approuve',
        date_moderation: new Date()
      };
      const result = await Comment.update(id, updateData);
      if (result.affectedRows === 0) {
        return { error: true, message: "Commentaire non trouvé" };
      }
      return { error: false, message: "Commentaire approuvé avec succès" };
    } catch (error) {
      console.error('Erreur lors de l\'approbation du commentaire:', error);
      return { error: true, message: "Error approving comment" };
    }
  }

  static async rejectComment(id, reason) {
    try {
      const updateData = {
        statut: 'rejete',
        date_moderation: new Date(),
        notes_moderation: reason || 'Commentaire rejeté par l\'administrateur'
      };
      const result = await Comment.update(id, updateData);
      if (result.affectedRows === 0) {
        return { error: true, message: "Commentaire non trouvé" };
      }
      return { error: false, message: "Commentaire rejeté avec succès" };
    } catch (error) {
      console.error('Erreur lors du rejet du commentaire:', error);
      return { error: true, message: "Error rejecting comment" };
    }
  }

  static async adminDeleteComment(id) {
    try {
      const result = await Comment.adminDelete(id);
      if (result.affectedRows === 0) {
        return { error: true, message: "Commentaire non trouvé" };
      }
      return { error: false, message: "Commentaire supprimé avec succès (admin)" };
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire (admin):', error);
      return { error: true, message: "Error deleting comment (admin)" };
    }
  }
}

module.exports = CommentService;
