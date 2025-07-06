const AnalyticsService = require('../services/AnalyticsService');

class AnalyticsController {
  static async getDashboardStats(req, res) {
    try {
      console.log("🎯 AnalyticsController: getDashboardStats called");
      const result = await AnalyticsService.getDashboardStats();
      console.log("🎯 AnalyticsController: Service result:", result.error ? 'ERROR' : 'SUCCESS');
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('🎯 AnalyticsController Error:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async getBooksAnalytics(req, res) {
    try {
      const { period } = req.query;
      const result = await AnalyticsService.getBooksAnalytics(period);
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics des livres:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async getUsersAnalytics(req, res) {
    try {
      const { period } = req.query;
      const result = await AnalyticsService.getUsersAnalytics(period);
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics des utilisateurs:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async getBorrowsAnalytics(req, res) {
    try {
      const { period } = req.query;
      const result = await AnalyticsService.getBorrowsAnalytics(period);
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics des emprunts:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async getTopBooks(req, res) {
    try {
      const { limit, period } = req.query;
      const result = await AnalyticsService.getTopBooks(limit, period);
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération du top des livres:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async getActiveUsers(req, res) {
    try {
      const { limit, period } = req.query;
      const result = await AnalyticsService.getActiveUsers(limit, period);
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs actifs:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async getMonthlyTrends(req, res) {
    try {
      const { year } = req.query;
      const result = await AnalyticsService.getMonthlyTrends(year);
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération des tendances mensuelles:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async getGenreStats(req, res) {
    try {
      const result = await AnalyticsService.getGenreStats();
      
      if (result.error) {
        return res.status(500).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques par genre:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }
}

module.exports = AnalyticsController;
