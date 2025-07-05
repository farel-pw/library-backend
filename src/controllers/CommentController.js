const CommentService = require('../services/CommentService');

class CommentController {
  static async getCommentsByBook(req, res) {
    try {
      const { id } = req.params;
      const result = await CommentService.getCommentsByBook(id);
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération des commentaires:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async createComment(req, res) {
    try {
      const result = await CommentService.createComment(req.body);
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Erreur lors de la création du commentaire:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async updateNote(req, res) {
    try {
      const result = await CommentService.updateNote(req.body);
      
      if (result.error) {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la note:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async deleteComment(req, res) {
    try {
      const { id } = req.params;
      const result = await CommentService.deleteComment(id);
      
      if (result.error) {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }
}

module.exports = CommentController;
