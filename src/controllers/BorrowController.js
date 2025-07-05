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
      const result = await BorrowService.createBorrow(req.body);
      
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
}

module.exports = BorrowController;
