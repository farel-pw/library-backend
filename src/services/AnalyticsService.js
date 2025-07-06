const Analytics = require('../models/Analytics');

class AnalyticsService {
  static async getDashboardStats() {
    try {
      console.log("📊 AnalyticsService: Starting getDashboardStats");
      const stats = await Analytics.getDashboardStats();
      console.log("📊 AnalyticsService: Dashboard stats retrieved successfully");
      return { error: false, data: stats };
    } catch (error) {
      console.error('📊 AnalyticsService Error:', error);
      console.error('📊 AnalyticsService Error Stack:', error.stack);
      return { error: true, message: "Error fetching dashboard stats" };
    }
  }

  static async getBooksAnalytics(period = '30') {
    try {
      const analytics = await Analytics.getBooksAnalytics(period);
      return { error: false, data: analytics };
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics des livres:', error);
      return { error: true, message: "Error fetching books analytics" };
    }
  }

  static async getUsersAnalytics(period = '30') {
    try {
      const analytics = await Analytics.getUsersAnalytics(period);
      return { error: false, data: analytics };
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics des utilisateurs:', error);
      return { error: true, message: "Error fetching users analytics" };
    }
  }

  static async getBorrowsAnalytics(period = '30') {
    try {
      const analytics = await Analytics.getBorrowsAnalytics(period);
      return { error: false, data: analytics };
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics des emprunts:', error);
      return { error: true, message: "Error fetching borrows analytics" };
    }
  }

  static async getTopBooks(limit = 10, period = '30') {
    try {
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
