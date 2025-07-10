const Reservation = require('../models/Reservation');
const NotificationManagerService = require('./NotificationManagerService');

class ReservationService {
  static async getReservationsByBook(bookId) {
    try {
      const reservations = await Reservation.findByBook(bookId);
      return { error: false, data: reservations };
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations du livre:', error);
      return { error: true, message: "Error fetching book reservations" };
    }
  }

  static async getReservationsByUser(userId) {
    try {
      const reservations = await Reservation.findByUserId(userId);
      
      // Pour chaque réservation, calculer la position dans la file d'attente
      const reservationsWithPosition = await Promise.all(
        reservations.map(async (reservation) => {
          const position = await Reservation.getPositionInQueue(reservation.livre_id, reservation.id);
          const totalReservations = await Reservation.getTotalReservationsForBook(reservation.livre_id);
          
          return {
            ...reservation,
            position: position,
            total_reservations: totalReservations
          };
        })
      );
      
      return { error: false, data: reservationsWithPosition };
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations de l\'utilisateur:', error);
      return { error: true, message: "Error fetching user reservations" };
    }
  }

  static async createReservation(reservationData) {
    try {
      // Vérifier si le livre est disponible
      const Book = require('../models/Book');
      const book = await Book.findById(reservationData.livre_id);
      
      if (!book) {
        return { error: true, message: "Livre non trouvé" };
      }

      // Vérifier si l'utilisateur a déjà une réservation pour ce livre
      const existingReservation = await Reservation.findByUserAndBook(
        reservationData.utilisateur_id, 
        reservationData.livre_id
      );
      
      if (existingReservation) {
        return { error: true, message: "Vous avez déjà une réservation pour ce livre" };
      }

      const newReservation = {
        utilisateur_id: reservationData.utilisateur_id,
        livre_id: reservationData.livre_id,
        date_reservation: new Date(),
        statut: 'en_attente'
      };

      const result = await Reservation.create(newReservation);
      return { error: false, message: "Réservation créée avec succès", id: result.insertId };
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      return { error: true, message: "Error creating reservation" };
    }
  }

  static async createReservationFromUnavailableBook(reservationData) {
    try {
      // Vérifier si l'utilisateur a déjà une réservation active pour ce livre
      const existingReservation = await new Promise((resolve, reject) => {
        const query = `
          SELECT COUNT(*) as count 
          FROM reservations 
          WHERE utilisateur_id = ? AND livre_id = ? AND statut = 'active'
        `;
        
        const connection = require('../config/database');
        connection.query(query, [reservationData.utilisateur_id, reservationData.livre_id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows[0].count > 0);
        });
      });

      if (existingReservation) {
        return { error: true, message: "Vous avez déjà une réservation active pour ce livre" };
      }

      // Vérifier si l'utilisateur a déjà emprunté ce livre
      const Borrow = require('../models/Borrow');
      const hasActiveBorrow = await new Promise((resolve, reject) => {
        const query = `
          SELECT COUNT(*) as count 
          FROM emprunts 
          WHERE utilisateur_id = ? AND livre_id = ? AND date_retour_effective IS NULL
        `;
        
        const connection = require('../config/database');
        connection.query(query, [reservationData.utilisateur_id, reservationData.livre_id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows[0].count > 0);
        });
      });

      if (hasActiveBorrow) {
        return { error: true, message: "Vous avez déjà emprunté ce livre" };
      }

      // Créer la réservation
      const newReservation = {
        utilisateur_id: reservationData.utilisateur_id,
        livre_id: reservationData.livre_id,
        date_reservation: new Date(),
        statut: 'active',
        priorite: 'normale'
      };

      const result = await Reservation.create(newReservation);
      
      // Calculer la position dans la file d'attente
      const position = await Reservation.getPositionInQueue(reservationData.livre_id, result.insertId);
      
      console.log(`📋 Réservation créée - Livre ${reservationData.livre_id}: Position ${position} dans la file d'attente`);
      
      return { 
        error: false, 
        message: "Réservation créée avec succès", 
        id: result.insertId,
        position: position
      };
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      return { error: true, message: "Error creating reservation" };
    }
  }

  static async deleteReservation(id) {
    try {
      const result = await Reservation.delete(id);
      if (result.affectedRows === 0) {
        return { error: true, message: "Réservation non trouvée" };
      }
      return { error: false, message: "Réservation supprimée avec succès" };
    } catch (error) {
      console.error('Erreur lors de la suppression de la réservation:', error);
      return { error: true, message: "Error deleting reservation" };
    }
  }

  static async promoteNextInQueue(bookId) {
    try {
      // Trouver la première réservation en attente pour ce livre
      const nextReservation = await Reservation.getNextInQueue(bookId);
      
      if (nextReservation) {
        // Mettre à jour le statut de la réservation
        await Reservation.updateStatus(nextReservation.id, 'validée');
        
        // Ici on pourrait ajouter une notification à l'utilisateur
        // Pour l'instant, on retourne juste les informations
        return { 
          error: false, 
          message: "Prochaine réservation promue", 
          reservation: nextReservation 
        };
      }
      
      return { error: false, message: "Aucune réservation en attente" };
    } catch (error) {
      console.error('Erreur lors de la promotion de la file d\'attente:', error);
      return { error: true, message: "Error promoting queue" };
    }
  }

  static async getAllReservations() {
    try {
      console.log("📚 ReservationService: Starting getAllReservations");
      const reservations = await Reservation.findAll();
      console.log("📚 ReservationService: Reservations retrieved successfully, count:", reservations.length);
      return { error: false, data: reservations };
    } catch (error) {
      console.error('📚 ReservationService Error:', error);
      console.error('📚 ReservationService Error Stack:', error.stack);
      return { error: true, message: "Error fetching reservations" };
    }
  }

  static async getAllReservationsWithDetails() {
    try {
      console.log("📚 ReservationService: Starting getAllReservationsWithDetails");
      const reservations = await Reservation.findAllWithDetails();
      console.log("📚 ReservationService: Reservations with details retrieved successfully, count:", reservations.length);
      return { error: false, data: reservations };
    } catch (error) {
      console.error('📚 ReservationService Error:', error);
      console.error('📚 ReservationService Error Stack:', error.stack);
      return { error: true, message: "Error fetching reservations with details" };
    }
  }

  static async updateReservation(id, updateData) {
    try {
      const result = await Reservation.update(id, updateData);
      if (result.affectedRows === 0) {
        return { error: true, message: "Réservation non trouvée" };
      }
      return { error: false, message: "Réservation mise à jour avec succès" };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la réservation:', error);
      return { error: true, message: "Error updating reservation" };
    }
  }

  static async approveReservation(id) {
    try {
      // D'abord récupérer les détails de la réservation
      const reservations = await Reservation.findAllWithDetails();
      const reservation = reservations.find(r => r.id === parseInt(id));
      
      if (!reservation) {
        return { error: true, message: "Réservation non trouvée" };
      }

      // Mettre à jour le statut
      const result = await Reservation.updateStatus(id, 'validée');
      if (result.affectedRows === 0) {
        return { error: true, message: "Réservation non trouvée" };
      }

      // Envoyer la notification à l'utilisateur
      try {
        await NotificationManagerService.notifyReservationApproved(
          id, 
          reservation.utilisateur_id, 
          reservation.livre_id
        );
        console.log(`📧 Notification envoyée pour la réservation ${id}`);
      } catch (notificationError) {
        console.error('❌ Erreur envoi notification réservation:', notificationError);
        // Ne pas faire échouer l'approbation si la notification échoue
      }

      return { error: false, message: "Réservation approuvée avec succès" };
    } catch (error) {
      console.error('Erreur lors de l\'approbation de la réservation:', error);
      return { error: true, message: "Error approving reservation" };
    }
  }

  static async rejectReservation(id, reason) {
    try {
      const updateData = {
        statut: 'rejetée',
        notes_admin: reason || 'Réservation rejetée par l\'administrateur'
      };
      const result = await Reservation.update(id, updateData);
      if (result.affectedRows === 0) {
        return { error: true, message: "Réservation non trouvée" };
      }
      return { error: false, message: "Réservation rejetée avec succès" };
    } catch (error) {
      console.error('Erreur lors du rejet de la réservation:', error);
      return { error: true, message: "Error rejecting reservation" };
    }
  }
}

module.exports = ReservationService;
