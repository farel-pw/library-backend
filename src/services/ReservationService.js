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
      return { error: false, data: reservations };
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations de l\'utilisateur:', error);
      return { error: true, message: "Error fetching user reservations" };
    }
  }

  static async createReservation(reservationData) {
    try {
      const newReservation = {
        utilisateur_id: reservationData.utilisateur_id,
        livre_id: reservationData.livre_id,
        date_reservation: new Date()
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
}

module.exports = ReservationService;
