const Borrow = require('../models/Borrow');
const connection = require('../config/database');

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
      // Vérifier la disponibilité du livre (3 exemplaires max)
      const availabilityCheck = await new Promise((resolve, reject) => {
        const query = `
          SELECT 
            l.id,
            l.titre,
            3 as exemplaires_total,
            COUNT(e.id) as emprunts_actifs,
            GREATEST(0, 3 - COUNT(e.id)) as exemplaires_disponibles,
            COALESCE(res.count, 0) as reservations_actives
          FROM livres l
          LEFT JOIN emprunts e ON l.id = e.livre_id AND e.date_retour_effective IS NULL
          LEFT JOIN (
            SELECT livre_id, COUNT(*) as count 
            FROM reservations 
            WHERE statut = 'active' 
            GROUP BY livre_id
          ) res ON l.id = res.livre_id
          WHERE l.id = ?
          GROUP BY l.id
        `;
        
        connection.query(query, [borrowData.livre_id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows[0]);
        });
      });

      if (!availabilityCheck) {
        return { error: true, message: "Livre non trouvé" };
      }

      if (availabilityCheck.exemplaires_disponibles <= 0) {
        // Si aucun exemplaire disponible, suggérer la réservation
        return { 
          error: true, 
          message: "Tous les exemplaires de ce livre sont déjà empruntés. Vous pouvez le réserver pour être notifié dès qu'un exemplaire devient disponible.", 
          canReserve: true,
          reservationsActives: availabilityCheck.reservations_actives
        };
      }

      // Vérifier si l'utilisateur a déjà emprunté ce livre
      const userBorrowCheck = await new Promise((resolve, reject) => {
        const query = `
          SELECT COUNT(*) as count 
          FROM emprunts 
          WHERE utilisateur_id = ? AND livre_id = ? AND date_retour_effective IS NULL
        `;
        
        connection.query(query, [borrowData.utilisateur_id, borrowData.livre_id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows[0].count > 0);
        });
      });

      if (userBorrowCheck) {
        return { error: true, message: "Vous avez déjà emprunté ce livre" };
      }

      const newBorrow = {
        utilisateur_id: borrowData.utilisateur_id,
        livre_id: borrowData.livre_id,
        date_emprunt: new Date(),
        date_retour_prevue: borrowData.date_retour_prevue,
        statut: 'en_cours'
      };

      const result = await Borrow.create(newBorrow);
      
      console.log(`📚 Emprunt créé - Livre ${borrowData.livre_id}: ${availabilityCheck.emprunts_actifs + 1}/3 exemplaires empruntés`);
      
      return { 
        error: false, 
        message: "Emprunt créé avec succès", 
        id: result.insertId,
        exemplaires_restants: availabilityCheck.exemplaires_disponibles - 1
      };
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

      // Effectuer le retour avec mise à jour du statut
      const updateData = {
        date_retour_effective: new Date(),
        statut: 'retourne'
      };

      const result = await Borrow.update(borrowId, updateData);
      if (result.affectedRows === 0) {
        return { error: true, message: "Emprunt non trouvé" };
      }

      // Calculer les nouvelles disponibilités après retour
      const newAvailability = await new Promise((resolve, reject) => {
        const query = `
          SELECT 
            l.id,
            l.titre,
            3 as exemplaires_total,
            COUNT(e.id) as emprunts_actifs,
            GREATEST(0, 3 - COUNT(e.id)) as exemplaires_disponibles
          FROM livres l
          LEFT JOIN emprunts e ON l.id = e.livre_id AND e.date_retour_effective IS NULL
          WHERE l.id = ?
          GROUP BY l.id
        `;
        
        connection.query(query, [borrowInfo.livre_id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows[0]);
        });
      });

      console.log(`📚 Retour effectué - Livre ${borrowInfo.livre_id}: ${newAvailability.emprunts_actifs}/3 exemplaires empruntés`);

      // Après le retour, vérifier s'il y a des réservations en attente pour ce livre
      const ReservationService = require('./ReservationService');
      await ReservationService.promoteNextInQueue(borrowInfo.livre_id);

      return { 
        error: false, 
        message: "Livre retourné avec succès",
        exemplaires_disponibles: newAvailability.exemplaires_disponibles
      };
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
        notes_admin: returnData.notes_admin || null,
        statut: 'retourne'
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

  static async updateBorrowStatuses() {
    try {
      // Mettre à jour automatiquement les statuts des emprunts retournés
      const updateQuery = `
        UPDATE emprunts 
        SET statut = 'retourne' 
        WHERE date_retour_effective IS NOT NULL 
        AND (statut = 'en_cours' OR statut IS NULL OR statut = '')
      `;
      
      const result = await new Promise((resolve, reject) => {
        connection.query(updateQuery, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      console.log(`📊 ${result.affectedRows} emprunts mis à jour avec le statut 'retourne'`);
      
      return { 
        error: false, 
        message: `${result.affectedRows} emprunts mis à jour`,
        updated: result.affectedRows
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour des statuts:', error);
      return { error: true, message: "Error updating borrow statuses" };
    }
  }
}

module.exports = BorrowService;
