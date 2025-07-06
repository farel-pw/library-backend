const Notification = require('../models/Notification');
const NotificationService = require('./NotificationService');
const User = require('../models/User');
const Book = require('../models/Book');

class NotificationManagerService {
  
  // Vérifier et envoyer les notifications pour les emprunts en retard
  static async checkAndNotifyOverdueBooks() {
    try {
      console.log('🔍 Vérification des emprunts en retard...');
      
      const overdueBooks = await Notification.findOverdueBorrows();
      console.log(`📊 ${overdueBooks.length} emprunt(s) en retard trouvé(s)`);
      
      let notificationsSent = 0;
      
      for (const borrow of overdueBooks) {
        // Vérifier si l'emprunt a déjà été notifié récemment
        const wasNotified = await Notification.wasRecentlyNotified(borrow.id);
        
        if (!wasNotified) {
          // Créer la notification en base
          const notificationData = {
            utilisateur_id: borrow.utilisateur_id,
            type: 'emprunt_retard',
            titre: `Livre en retard: ${borrow.titre}`,
            message: `Le livre "${borrow.titre}" est en retard de ${borrow.jours_retard} jour(s). Merci de le retourner dès que possible.`,
            email_sent: false
          };
          
          await Notification.create(notificationData);
          
          // Envoyer l'email
          const emailResult = await NotificationService.notifyLateReturn(
            {
              nom: borrow.nom,
              prenom: borrow.prenom,
              email: borrow.email
            },
            {
              titre: borrow.titre,
              auteur: borrow.auteur,
              isbn: borrow.isbn
            },
            borrow.jours_retard
          );
          
          if (!emailResult.error) {
            // Marquer la notification comme envoyée par email
            notificationData.email_sent = true;
            await Notification.create(notificationData);
            
            // Marquer l'emprunt comme notifié
            await Notification.markBorrowAsNotified(borrow.id);
            
            notificationsSent++;
            console.log(`✅ Notification envoyée à ${borrow.email} pour "${borrow.titre}"`);
          } else {
            console.log(`❌ Erreur envoi email à ${borrow.email}:`, emailResult.message);
          }
        } else {
          console.log(`ℹ️ Emprunt ${borrow.id} déjà notifié récemment`);
        }
      }
      
      console.log(`📧 ${notificationsSent} notification(s) envoyée(s) pour retard`);
      return { 
        error: false, 
        message: `${notificationsSent} notifications envoyées`,
        overdueCount: overdueBooks.length,
        notificationsSent 
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des retards:', error);
      return { error: true, message: error.message };
    }
  }

  // Notifier l'approbation d'une réservation
  static async notifyReservationApproved(reservationId, userId, bookId) {
    try {
      console.log(`📧 Envoi notification réservation approuvée: ${reservationId}`);
      
      // Récupérer les informations de l'utilisateur et du livre
      const user = await User.findById(userId);
      const book = await Book.findById(bookId);
      
      if (!user || !book) {
        return { error: true, message: 'Utilisateur ou livre non trouvé' };
      }
      
      // Créer la notification en base
      const notificationData = {
        utilisateur_id: userId,
        type: 'reservation_validee',
        titre: `Réservation validée: ${book.titre}`,
        message: `Votre réservation pour "${book.titre}" a été validée. Le livre est maintenant disponible pour vous.`,
        email_sent: false
      };
      
      await Notification.create(notificationData);
      
      // Envoyer l'email
      const emailResult = await NotificationService.notifyReservationApproved(
        {
          nom: user.nom,
          prenom: user.prenom,
          email: user.email
        },
        {
          titre: book.titre,
          auteur: book.auteur,
          isbn: book.isbn
        },
        {
          id: reservationId,
          date_reservation: new Date()
        }
      );
      
      if (!emailResult.error) {
        // Marquer la notification comme envoyée par email
        notificationData.email_sent = true;
        await Notification.create(notificationData);
        
        console.log(`✅ Notification réservation envoyée à ${user.email}`);
        return { error: false, message: 'Notification envoyée avec succès' };
      } else {
        console.log(`❌ Erreur envoi email à ${user.email}:`, emailResult.message);
        return { error: true, message: emailResult.message };
      }
      
    } catch (error) {
      console.error('❌ Erreur notification réservation:', error);
      return { error: true, message: error.message };
    }
  }

  // Récupérer les notifications d'un utilisateur
  static async getUserNotifications(userId, limit = 50) {
    try {
      const notifications = await Notification.findByUserId(userId, limit);
      return { error: false, data: notifications };
    } catch (error) {
      console.error('❌ Erreur récupération notifications:', error);
      return { error: true, message: error.message };
    }
  }

  // Récupérer les notifications non lues d'un utilisateur
  static async getUnreadNotifications(userId) {
    try {
      const notifications = await Notification.findUnreadByUserId(userId);
      return { error: false, data: notifications };
    } catch (error) {
      console.error('❌ Erreur récupération notifications non lues:', error);
      return { error: true, message: error.message };
    }
  }

  // Marquer une notification comme lue
  static async markNotificationAsRead(notificationId) {
    try {
      await Notification.markAsRead(notificationId);
      return { error: false, message: 'Notification marquée comme lue' };
    } catch (error) {
      console.error('❌ Erreur marquage notification lue:', error);
      return { error: true, message: error.message };
    }
  }

  // Marquer toutes les notifications d'un utilisateur comme lues
  static async markAllNotificationsAsRead(userId) {
    try {
      await Notification.markAllAsRead(userId);
      return { error: false, message: 'Toutes les notifications marquées comme lues' };
    } catch (error) {
      console.error('❌ Erreur marquage toutes notifications lues:', error);
      return { error: true, message: error.message };
    }
  }

  // Supprimer une notification
  static async deleteNotification(notificationId) {
    try {
      await Notification.delete(notificationId);
      return { error: false, message: 'Notification supprimée' };
    } catch (error) {
      console.error('❌ Erreur suppression notification:', error);
      return { error: true, message: error.message };
    }
  }

  // Statistiques des notifications (pour l'admin)
  static async getNotificationStats() {
    try {
      const stats = await Notification.getStats();
      return { error: false, data: stats };
    } catch (error) {
      console.error('❌ Erreur statistiques notifications:', error);
      return { error: true, message: error.message };
    }
  }

  // Récupérer toutes les notifications (pour l'admin)
  static async getAllNotifications(limit = 100) {
    try {
      const notifications = await Notification.findAll(limit);
      return { error: false, data: notifications };
    } catch (error) {
      console.error('❌ Erreur récupération toutes notifications:', error);
      return { error: true, message: error.message };
    }
  }

  // Tester la configuration email
  static async testEmailConfiguration() {
    try {
      const result = await NotificationService.testEmailConfiguration();
      return result;
    } catch (error) {
      console.error('❌ Erreur test email:', error);
      return { error: true, message: error.message };
    }
  }
}

module.exports = NotificationManagerService;
