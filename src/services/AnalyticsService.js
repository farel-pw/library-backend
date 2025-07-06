/**
 * Service Analytics - Logique métier pour les statistiques
 * 
 * Ce service contient la logique métier pour toutes les opérations d'analytics :
 * - Récupération et traitement des statistiques
 * - Calculs d'agrégations et de métriques
 * - Formatage des données pour l'API
 * - Gestion des erreurs de traitement des données
 * 
 * @author Votre Nom
 * @version 1.0.0
 */

const Analytics = require('../models/Analytics');

class AnalyticsService {
  /**
   * Récupère et traite les statistiques du tableau de bord
   * 
   * Cette méthode orchestre la récupération de toutes les métriques principales :
   * - Compteurs globaux (utilisateurs, livres, emprunts)
   * - Métriques d'activité (emprunts actifs, en retard)
   * - Indicateurs de performance
   * 
   * @returns {Object} Données formatées pour le dashboard
   */
  static async getDashboardStats() {
    try {
      console.log("📊 AnalyticsService: Début de la récupération des statistiques du dashboard");
      
      // Récupération des données brutes depuis le modèle
      const stats = await Analytics.getDashboardStats();
      
      console.log("📊 AnalyticsService: Statistiques récupérées avec succès");
      console.log("📊 Détails des stats:", stats);
      
      return { error: false, data: stats };
    } catch (error) {
      console.error('❌ AnalyticsService Error:', error);
      console.error('❌ AnalyticsService Error Stack:', error.stack);
      return { error: true, message: "Erreur lors de la récupération des statistiques du dashboard" };
    }
  }

  /**
   * Récupère les analytics spécifiques aux livres
   * 
   * Analyse les données des livres sur une période donnée :
   * - Livres les plus populaires
   * - Taux d'emprunt par genre
   * - Tendances temporelles
   * 
   * @param {string} period - Période d'analyse (défaut: 30 jours)
   * @returns {Object} Analytics des livres
   */
  static async getBooksAnalytics(period = '30') {
    try {
      console.log(`📚 AnalyticsService: Récupération des analytics des livres (période: ${period} jours)`);
      
      const analytics = await Analytics.getBooksAnalytics(period);
      
      console.log("📚 Analytics des livres récupérées avec succès");
      return { error: false, data: analytics };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des analytics des livres:', error);
      return { error: true, message: "Erreur lors de la récupération des analytics des livres" };
    }
  }

  /**
   * Récupère les analytics spécifiques aux utilisateurs
   * 
   * Analyse les données des utilisateurs sur une période donnée :
   * - Utilisateurs les plus actifs
   * - Nouvelles inscriptions
   * - Patterns d'utilisation
   * 
   * @param {string} period - Période d'analyse (défaut: 30 jours)
   * @returns {Object} Analytics des utilisateurs
   */
  static async getUsersAnalytics(period = '30') {
    try {
      console.log(`👥 AnalyticsService: Récupération des analytics des utilisateurs (période: ${period} jours)`);
      
      const analytics = await Analytics.getUsersAnalytics(period);
      
      console.log("👥 Analytics des utilisateurs récupérées avec succès");
      return { error: false, data: analytics };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des analytics des utilisateurs:', error);
      return { error: true, message: "Erreur lors de la récupération des analytics des utilisateurs" };
    }
  }

  /**
   * Récupère les analytics spécifiques aux emprunts
   * 
   * Analyse les données des emprunts sur une période donnée :
   * - Tendances d'emprunts
   * - Taux de retour
   * - Emprunts en retard
   * 
   * @param {string} period - Période d'analyse (défaut: 30 jours)
   * @returns {Object} Analytics des emprunts
   */
  static async getBorrowsAnalytics(period = '30') {
    try {
      console.log(`📅 AnalyticsService: Récupération des analytics des emprunts (période: ${period} jours)`);
      
      const analytics = await Analytics.getBorrowsAnalytics(period);
      
      console.log("📅 Analytics des emprunts récupérées avec succès");
      return { error: false, data: analytics };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des analytics des emprunts:', error);
      return { error: true, message: "Erreur lors de la récupération des analytics des emprunts" };
    }
  }

  /**
   * Récupère la liste des livres les plus populaires
   * 
   * @param {number} limit - Nombre maximum de livres à retourner (défaut: 10)
   * @param {string} period - Période d'analyse (défaut: 30 jours)
   * @returns {Object} Top des livres les plus empruntés
   */
  static async getTopBooks(limit = 10, period = '30') {
    try {
      console.log(`🏆 AnalyticsService: Récupération du top ${limit} des livres (période: ${period} jours)`);
      
      const topBooks = await Analytics.getTopBooks(limit, period);
      return { error: false, data: topBooks };
    } catch (error) {
      console.error('Erreur lors de la récupération du top des livres:', error);
      return { error: true, message: "Error fetching top books" };
    }
  }

  static async getActiveUsers(limit = 10, period = '30') {
    try {
      const activeUsers = await Analytics.getActiveUsers(limit, period);
      return { error: false, data: activeUsers };
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs actifs:', error);
      return { error: true, message: "Error fetching active users" };
    }
  }

  static async getMonthlyTrends(year = new Date().getFullYear()) {
    try {
      const trends = await Analytics.getMonthlyTrends(year);
      return { error: false, data: trends };
    } catch (error) {
      console.error('Erreur lors de la récupération des tendances mensuelles:', error);
      return { error: true, message: "Error fetching monthly trends" };
    }
  }

  static async getGenreStats() {
    try {
      const genreStats = await Analytics.getGenreStats();
      return { error: false, data: genreStats };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques par genre:', error);
      return { error: true, message: "Error fetching genre stats" };
    }
  }
}

module.exports = AnalyticsService;
