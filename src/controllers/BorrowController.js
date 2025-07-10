const BorrowService = require('../services/BorrowService');

class BorrowController {
  static async getAllBorrowsWithDetails(req, res) {
    try {
      const result = await BorrowService.getAllBorrowsWithDetails();
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération des emprunts:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async getBorrowsByUser(req, res) {
    try {
      const { id } = req.params;
      const result = await BorrowService.getBorrowsByUser(id);
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération des emprunts de l\'utilisateur:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async getMyBorrows(req, res) {
    try {
      // Utiliser l'ID de l'utilisateur connecté depuis le token
      const result = await BorrowService.getBorrowsByUser(req.user.id);
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération des emprunts de l\'utilisateur connecté:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async getBorrowsByUserNotReturned(req, res) {
    try {
      const { id } = req.params;
      const result = await BorrowService.getBorrowsByUserNotReturned(id);
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération des emprunts non rendus:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async isBookBorrowed(req, res) {
    try {
      const { id } = req.params;
      const result = await BorrowService.isBookBorrowed(id);
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'emprunt:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async createBorrow(req, res) {
    try {
      // Calculer la date de retour prévue (14 jours par défaut)
      const dateRetourPrevue = new Date();
      dateRetourPrevue.setDate(dateRetourPrevue.getDate() + 14);
      
      // Utiliser l'ID de l'utilisateur connecté depuis le token
      const borrowData = {
        ...req.body,
        utilisateur_id: req.user.id,
        date_retour_prevue: req.body.date_retour_prevue || dateRetourPrevue
      };
      
      const result = await BorrowService.createBorrow(borrowData);
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Erreur lors de la création de l\'emprunt:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async returnBook(req, res) {
    try {
      const { id } = req.params;
      const result = await BorrowService.returnBook(id);
      
      if (result.error) {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors du retour du livre:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async getReturnedBorrows(req, res) {
    try {
      const result = await BorrowService.getReturnedBorrows();
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération des emprunts rendus:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async getAllBorrows(req, res) {
    try {
      const result = await BorrowService.getAllBorrows();
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération de tous les emprunts:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async getBorrowById(req, res) {
    try {
      const { id } = req.params;
      const result = await BorrowService.getBorrowById(id);
      
      if (result.error) {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'emprunt:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async updateBorrow(req, res) {
    try {
      const { id } = req.params;
      const result = await BorrowService.updateBorrow(id, req.body);
      
      if (result.error) {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'emprunt:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async adminReturnBook(req, res) {
    try {
      const { id } = req.params;
      const result = await BorrowService.adminReturnBook(id, req.body);
      
      if (result.error) {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors du retour du livre (admin):', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async extendBorrow(req, res) {
    try {
      const { id } = req.params;
      const { newDate } = req.body;
      const result = await BorrowService.extendBorrow(id, newDate);
      
      if (result.error) {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de l\'extension de l\'emprunt:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async getBookAvailability(req, res) {
    try {
      const { id } = req.params;
      const availability = await Borrow.getBookAvailability(id);
      
      if (!availability) {
        return res.status(404).json({ error: true, message: "Livre non trouvé" });
      }
      
      res.status(200).json({ 
        error: false, 
        data: availability 
      });
    } catch (error) {
      console.error('Erreur lors de la vérification de la disponibilité:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async createReservation(req, res) {
    try {
      const ReservationService = require('../services/ReservationService');
      const reservationData = {
        utilisateur_id: req.user.id,
        livre_id: req.body.livre_id
      };

      const result = await ReservationService.createReservationFromUnavailableBook(reservationData);
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async updateBorrowStatuses(req, res) {
    try {
      const result = await BorrowService.updateBorrowStatuses();
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des statuts:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }
}

module.exports = BorrowController;
