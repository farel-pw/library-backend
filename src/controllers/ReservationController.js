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
      const { livre_id } = req.body;
      
      if (!livre_id) {
        return res.status(400).json({ error: true, message: "ID du livre requis" });
      }

      const reservationData = {
        utilisateur_id: req.user.id,
        livre_id: livre_id
      };

      const result = await ReservationService.createReservation(reservationData);
      
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

  static async getMyReservations(req, res) {
    try {
      const result = await ReservationService.getReservationsByUser(req.user.id);
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations de l\'utilisateur connecté:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async getAllReservations(req, res) {
    try {
      console.log("🎯 ReservationController: getAllReservations called");
      const result = await ReservationService.getAllReservations();
      console.log("🎯 ReservationController: Service result:", result.error ? 'ERROR' : 'SUCCESS');
      
      if (result.error) {
        console.log("🎯 ReservationController: Returning error response");
        return res.status(500).json(result);
      }
      
      console.log("🎯 ReservationController: Returning success response with", result.data?.length || 0, "reservations");
      res.status(200).json(result);
    } catch (error) {
      console.error('🎯 ReservationController Error:', error);
      console.error('🎯 ReservationController Error Stack:', error.stack);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async getAllReservationsWithDetails(req, res) {
    try {
      console.log("🎯 ReservationController: getAllReservationsWithDetails called");
      const result = await ReservationService.getAllReservationsWithDetails();
      console.log("🎯 ReservationController: Service result:", result.error ? 'ERROR' : 'SUCCESS');
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('🎯 ReservationController Error:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async updateReservation(req, res) {
    try {
      const { id } = req.params;
      const result = await ReservationService.updateReservation(id, req.body);
      
      if (result.error) {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la réservation:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async approveReservation(req, res) {
    try {
      const { id } = req.params;
      const result = await ReservationService.approveReservation(id);
      
      if (result.error) {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de l\'approbation de la réservation:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async rejectReservation(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const result = await ReservationService.rejectReservation(id, reason);
      
      if (result.error) {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors du rejet de la réservation:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }
}

module.exports = ReservationController;
