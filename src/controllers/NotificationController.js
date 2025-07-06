const NotificationManagerService = require('../services/NotificationManagerService');

class NotificationController {
  // Récupérer les notifications de l'utilisateur connecté
  static async getMyNotifications(req, res) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 50;
      
      const result = await NotificationManagerService.getUserNotifications(userId, limit);
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  // Récupérer les notifications non lues de l'utilisateur connecté
  static async getMyUnreadNotifications(req, res) {
    try {
      const userId = req.user.id;
      
      const result = await NotificationManagerService.getUnreadNotifications(userId);
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications non lues:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  // Marquer une notification comme lue
  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      
      const result = await NotificationManagerService.markNotificationAsRead(id);
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  // Marquer toutes les notifications comme lues
  static async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;
      
      const result = await NotificationManagerService.markAllNotificationsAsRead(userId);
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  // Supprimer une notification
  static async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      
      const result = await NotificationManagerService.deleteNotification(id);
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  // ADMIN: Déclencher la vérification des emprunts en retard
  static async checkOverdueBooks(req, res) {
    try {
      const result = await NotificationManagerService.checkAndNotifyOverdueBooks();
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la vérification des retards:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  // ADMIN: Récupérer toutes les notifications
  static async getAllNotifications(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      
      const result = await NotificationManagerService.getAllNotifications(limit);
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération de toutes les notifications:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  // ADMIN: Statistiques des notifications
  static async getNotificationStats(req, res) {
    try {
      const result = await NotificationManagerService.getNotificationStats();
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  // ADMIN: Tester la configuration email
  static async testEmailConfig(req, res) {
    try {
      const result = await NotificationManagerService.testEmailConfiguration();
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors du test email:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }
}

module.exports = NotificationController;
