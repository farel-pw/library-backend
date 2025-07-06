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
}

module.exports = CommentService;
