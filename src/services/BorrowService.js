const Borrow = require('../models/Borrow');

class BorrowService {
  static async getAllBorrowsWithDetails() {
    try {
      const borrows = await Borrow.findAllWithDetails();
      return { error: false, data: borrows };
    } catch (error) {
      console.error('Erreur lors de la récupération des emprunts:', error);
      return { error: true, message: "Error fetching borrows" };
    }
  }

  static async getBorrowsByUser(userId) {
    try {
      const borrows = await Borrow.findByUserId(userId);
      return { error: false, data: borrows };
    } catch (error) {
      console.error('Erreur lors de la récupération des emprunts de l\'utilisateur:', error);
      return { error: true, message: "Error fetching user borrows" };
    }
  }

  static async getBorrowsByUserNotReturned(userId) {
    try {
      const borrows = await Borrow.findByUserIdNotReturned(userId);
      return { error: false, data: borrows };
    } catch (error) {
      console.error('Erreur lors de la récupération des emprunts non rendus:', error);
      return { error: true, message: "Error fetching unreturned borrows" };
    }
  }

  static async isBookBorrowed(bookId) {
    try {
      const isBorrowed = await Borrow.isBookBorrowed(bookId);
      return { error: false, isBorrowed };
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'emprunt:', error);
      return { error: true, message: "Error checking borrow status" };
    }
  }

  static async createBorrow(borrowData) {
    try {
      // Vérifier si le livre est déjà emprunté
      const isAlreadyBorrowed = await Borrow.isBookBorrowed(borrowData.livre_id);
      if (isAlreadyBorrowed) {
        return { error: true, message: "Ce livre est déjà emprunté" };
      }

      const newBorrow = {
        utilisateur_id: borrowData.utilisateur_id,
        livre_id: borrowData.livre_id,
        date_emprunt: new Date(),
        date_retour_prevue: borrowData.date_retour_prevue
      };

      const result = await Borrow.create(newBorrow);
      return { error: false, message: "Emprunt créé avec succès", id: result.insertId };
    } catch (error) {
      console.error('Erreur lors de la création de l\'emprunt:', error);
      return { error: true, message: "Error creating borrow" };
    }
  }

  static async returnBook(borrowId) {
    try {
      // D'abord, récupérer les informations de l'emprunt
      const borrowInfo = await Borrow.findById(borrowId);
      if (!borrowInfo) {
        return { error: true, message: "Emprunt non trouvé" };
      }

      const result = await Borrow.returnBook(borrowId);
      if (result.affectedRows === 0) {
        return { error: true, message: "Emprunt non trouvé" };
      }

      // Après le retour, vérifier s'il y a des réservations en attente pour ce livre
      const ReservationService = require('./ReservationService');
      await ReservationService.promoteNextInQueue(borrowInfo.livre_id);

      return { error: false, message: "Livre retourné avec succès" };
    } catch (error) {
      console.error('Erreur lors du retour du livre:', error);
      return { error: true, message: "Error returning book" };
    }
  }

  static async getReturnedBorrows() {
    try {
      const borrows = await Borrow.findReturned();
      return { error: false, data: borrows };
    } catch (error) {
      console.error('Erreur lors de la récupération des emprunts rendus:', error);
      return { error: true, message: "Error fetching returned borrows" };
    }
  }

  static async getAllBorrows() {
    try {
      const borrows = await Borrow.findAll();
      return { error: false, data: borrows };
    } catch (error) {
      console.error('Erreur lors de la récupération de tous les emprunts:', error);
      return { error: true, message: "Error fetching all borrows" };
    }
  }

  static async getBorrowById(borrowId) {
    try {
      const borrow = await Borrow.findById(borrowId);
      if (!borrow) {
        return { error: true, message: "Emprunt non trouvé" };
      }
      return { error: false, data: borrow };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'emprunt:', error);
      return { error: true, message: "Error fetching borrow" };
    }
  }

  static async updateBorrow(borrowId, updateData) {
    try {
      const result = await Borrow.update(borrowId, updateData);
      if (result.affectedRows === 0) {
        return { error: true, message: "Emprunt non trouvé" };
      }
      return { error: false, message: "Emprunt mis à jour avec succès" };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'emprunt:', error);
      return { error: true, message: "Error updating borrow" };
    }
  }

  static async adminReturnBook(borrowId, returnData) {
    try {
      const borrowInfo = await Borrow.findById(borrowId);
      if (!borrowInfo) {
        return { error: true, message: "Emprunt non trouvé" };
      }

      const updateData = {
        date_retour_effective: new Date(),
        notes_admin: returnData.notes_admin || null
      };

      const result = await Borrow.update(borrowId, updateData);
      if (result.affectedRows === 0) {
        return { error: true, message: "Emprunt non trouvé" };
      }

      // Après le retour, vérifier s'il y a des réservations en attente pour ce livre
      const ReservationService = require('./ReservationService');
      await ReservationService.promoteNextInQueue(borrowInfo.livre_id);

      return { error: false, message: "Livre retourné avec succès (admin)" };
    } catch (error) {
      console.error('Erreur lors du retour du livre (admin):', error);
      return { error: true, message: "Error returning book (admin)" };
    }
  }

  static async extendBorrow(borrowId, newDate) {
    try {
      const updateData = {
        date_retour_prevue: new Date(newDate)
      };

      const result = await Borrow.update(borrowId, updateData);
      if (result.affectedRows === 0) {
        return { error: true, message: "Emprunt non trouvé" };
      }

      return { error: false, message: "Emprunt prolongé avec succès" };
    } catch (error) {
      console.error('Erreur lors de l\'extension de l\'emprunt:', error);
      return { error: true, message: "Error extending borrow" };
    }
  }
}

module.exports = BorrowService;
