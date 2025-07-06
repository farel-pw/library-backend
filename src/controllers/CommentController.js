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
      // Ajouter l'ID de l'utilisateur connecté
      const commentData = {
        ...req.body,
        utilisateur_id: req.user.id
      };
      
      const result = await CommentService.createComment(commentData);
      
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

  static async getBibliothequeComments(req, res) {
    try {
      const result = await CommentService.getBibliothequeComments();
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération des commentaires de la bibliothèque:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async createBibliothequeComment(req, res) {
    try {
      const commentData = {
        ...req.body,
        utilisateur_id: req.user.id
      };
      
      const result = await CommentService.createBibliothequeComment(commentData);
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Erreur lors de la création du commentaire sur la bibliothèque:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async getBibliothequeStats(req, res) {
    try {
      const result = await CommentService.getBibliothequeStats();
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de la bibliothèque:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async getMyComments(req, res) {
    try {
      const result = await CommentService.getCommentsByUser(req.user.id);
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération des commentaires de l\'utilisateur:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }
}

module.exports = CommentController;
