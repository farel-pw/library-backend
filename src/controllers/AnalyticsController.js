/**
 * Contrôleur Analytics - Gestion des statistiques et métriques
 * 
 * Ce contrôleur gère toutes les requêtes liées aux statistiques de la bibliothèque :
 * - Statistiques du tableau de bord (dashboard)
 * - Analyses des livres (emprunts, popularité, etc.)
 * - Analyses des utilisateurs (activité, nouveaux utilisateurs, etc.)
 * - Métriques temporelles et tendances
 * 
 * @author Votre Nom
 * @version 1.0.0
 */

const AnalyticsService = require('../services/AnalyticsService');

class AnalyticsController {
  /**
   * Récupère les statistiques principales pour le tableau de bord
   * 
   * Cette méthode fournit un aperçu global de l'activité de la bibliothèque :
   * - Nombre total d'utilisateurs, livres, emprunts
   * - Statistiques d'activité (emprunts actifs, en retard)
   * - Métriques de performance (réservations, commentaires)
   * 
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   * @returns {Object} Statistiques du tableau de bord
   */
  static async getDashboardStats(req, res) {
    try {
      console.log("🎯 AnalyticsController: Récupération des statistiques du dashboard");
      const result = await AnalyticsService.getDashboardStats();
      console.log("🎯 AnalyticsController: Service result:", result.error ? 'ERROR' : 'SUCCESS');
      
      if (result.error) {
        console.error("❌ Erreur lors de la récupération des statistiques:", result.message);
        return res.status(500).json(result);
      }
      
      console.log("✅ Statistiques du dashboard récupérées avec succès");
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ AnalyticsController Error:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  /**
   * Récupère les analytics spécifiques aux livres
   * 
   * Analyse les données liées aux livres sur une période donnée :
   * - Livres les plus empruntés
   * - Tendances d'emprunts par genre
   * - Taux de rotation des livres
   * 
   * @param {Object} req - Requête Express
   * @param {Object} req.query.period - Période d'analyse (30j, 90j, 1an, etc.)
   * @param {Object} res - Réponse Express
   * @returns {Object} Analytics des livres
   */
  static async getBooksAnalytics(req, res) {
    try {
      const { period } = req.query;
      console.log(`📚 Analytics des livres pour la période: ${period || 'par défaut'}`);
      
      const result = await AnalyticsService.getBooksAnalytics(period);
      
      if (result.error) {
        console.error("❌ Erreur lors de la récupération des analytics des livres:", result.message);
        return res.status(500).json(result);
      }
      
      console.log("✅ Analytics des livres récupérées avec succès");
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des analytics des livres:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  /**
   * Récupère les analytics spécifiques aux utilisateurs
   * 
   * Analyse les données liées aux utilisateurs sur une période donnée :
   * - Utilisateurs les plus actifs
   * - Nouvelles inscriptions
   * - Taux d'engagement
   * 
   * @param {Object} req - Requête Express
   * @param {Object} req.query.period - Période d'analyse (30j, 90j, 1an, etc.)
   * @param {Object} res - Réponse Express
   * @returns {Object} Analytics des utilisateurs
   */
  static async getUsersAnalytics(req, res) {
    try {
      const { period } = req.query;
      console.log(`👥 Analytics des utilisateurs pour la période: ${period || 'par défaut'}`);
      
      const result = await AnalyticsService.getUsersAnalytics(period);
      
      if (result.error) {
        console.error("❌ Erreur lors de la récupération des analytics des utilisateurs:", result.message);
        return res.status(500).json(result);
      }
      
      console.log("✅ Analytics des utilisateurs récupérées avec succès");
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des analytics des utilisateurs:', error);
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
