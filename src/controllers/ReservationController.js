const ReservationService = require('../services/ReservationService');

class ReservationController {
  static async getReservationsByBook(req, res) {
    try {
      const { livre_id } = req.query;
      
      if (!livre_id) {
        return res.status(400).json({ error: true, message: "ID du livre requis" });
      }

      const result = await ReservationService.getReservationsByBook(livre_id);
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations du livre:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async getReservationsByUser(req, res) {
    try {
      const { id } = req.params;
      const result = await ReservationService.getReservationsByUser(id);
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations de l\'utilisateur:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async createReservation(req, res) {
    try {
      const result = await ReservationService.createReservation(req.body);
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async deleteReservation(req, res) {
    try {
      const { id } = req.params;
      const result = await ReservationService.deleteReservation(id);
      
      if (result.error) {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la suppression de la réservation:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }
}

module.exports = ReservationController;
