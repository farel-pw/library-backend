const Reservation = require('../models/Reservation');

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
}

module.exports = ReservationService;
