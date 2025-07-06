const UserService = require('../services/UserService');

class UserController {
  static async getAllUsers(req, res) {
    try {
      const result = await UserService.getAllUsers();
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const result = await UserService.getUserById(id);
      
      if (result.error) {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const result = await UserService.updateUser(id, req.body);
      
      if (result.error) {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async createUser(req, res) {
    try {
      const result = await UserService.createUser(req.body);
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async toggleUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { active } = req.body;
      const result = await UserService.toggleUserStatus(id, active);
      
      if (result.error) {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const result = await UserService.deleteUser(id);
      
      if (result.error) {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async getCurrentUser(req, res) {
    try {
      const result = await UserService.getUserById(req.user.id);
      
      if (result.error) {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur actuel:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async updateCurrentUser(req, res) {
    try {
      const userId = req.user.id; // Utilisateur connecté
      const result = await UserService.updateUser(userId, req.body);
      
      if (result.error) {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }
}

module.exports = UserController;
