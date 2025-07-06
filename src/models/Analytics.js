/**
 * Modèle Analytics - Requêtes SQL pour les statistiques et métriques
 * 
 * Ce modèle centralise toutes les requêtes SQL complexes pour générer :
 * - Les statistiques du tableau de bord administrateur
 * - Les analyses par période (livres, utilisateurs, emprunts)
 * - Les métriques de performance et d'utilisation
 * - Les rapports détaillés pour les administrateurs
 * 
 * Chaque méthode encapsule une ou plusieurs requêtes SQL optimisées
 * pour récupérer les données nécessaires aux analyses.
 * 
 * @author Votre Nom
 * @version 1.0.0
 */

const mysql = require('mysql2');
const connection = require('../config/database');

class Analytics {
  /**
   * Récupère les statistiques principales pour le tableau de bord
   * 
   * Cette requête complexe agrège toutes les métriques essentielles :
   * - Compteurs de base (livres, utilisateurs, emprunts)
   * - Indicateurs d'activité (emprunts actifs, en retard)
   * - Métriques de performance (notes moyennes, réservations)
   * - Statistiques de notifications
   * 
   * @returns {Promise<Object>} Objet contenant toutes les statistiques du dashboard
   */
  static async getDashboardStats() {
    return new Promise((resolve, reject) => {
      console.log("📊 Analytics: Exécution de la requête dashboard stats...");
      
      const query = `
        SELECT 
          -- 📚 Statistiques des livres
          (SELECT COUNT(*) FROM livres) as total_livres,
          (SELECT COUNT(*) FROM livres WHERE disponible = 1) as livres_disponibles,
          
          -- 👥 Statistiques des utilisateurs
          (SELECT COUNT(*) FROM utilisateurs WHERE role = 'etudiant') as total_utilisateurs,
          (SELECT COUNT(*) FROM utilisateurs WHERE role = 'etudiant' AND useractive = 1) as utilisateurs_actifs,
          (SELECT COUNT(*) FROM utilisateurs 
           WHERE role = 'etudiant' AND date_creation >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as nouveaux_utilisateurs,
          
          -- 📅 Statistiques des emprunts
          (SELECT COUNT(*) FROM emprunts) as total_emprunts,
          (SELECT COUNT(*) FROM emprunts WHERE rendu = FALSE) as emprunts_actifs,
          (SELECT COUNT(*) FROM emprunts 
           WHERE rendu = FALSE AND date_retour_prevue < CURDATE()) as emprunts_en_retard,
          (SELECT COUNT(*) FROM emprunts 
           WHERE date_emprunt >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as emprunts_semaine,
          
          -- 🔖 Statistiques des réservations
          (SELECT COUNT(*) FROM reservations) as total_reservations,
          (SELECT COUNT(*) FROM reservations WHERE statut = 'en_attente') as reservations_en_attente,
          (SELECT COUNT(*) FROM reservations WHERE statut = 'validée') as reservations_pretes,
          
          -- 💬 Statistiques des commentaires
          (SELECT COUNT(*) FROM commentaires) as total_commentaires,
          (SELECT COUNT(*) FROM commentaires 
           WHERE date_creation >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as commentaires_semaine,
          (SELECT ROUND(AVG(note), 2) FROM commentaires WHERE note IS NOT NULL) as note_moyenne_generale,
          
          -- 🔔 Statistiques des notifications
          (SELECT COUNT(*) FROM notifications) as total_notifications,
          (SELECT COUNT(*) FROM notifications WHERE lu = FALSE) as notifications_non_lues,
          (SELECT COUNT(*) FROM notifications WHERE type = 'emprunt_retard') as notifications_retard,
          (SELECT COUNT(*) FROM notifications WHERE type = 'reservation_validee') as notifications_reservations
      `;
      
      connection.query(query, (err, rows) => {
        if (err) {
          console.error("❌ Analytics: Erreur SQL dashboard stats:", err);
          reject(err);
        } else {
          console.log("✅ Analytics: Dashboard stats récupérées avec succès");
          console.log("📊 Données:", rows[0]);
          resolve(rows[0]);
        }
      });
    });
  }

  /**
   * Analyse les données des livres par genre et popularité
   * 
   * Génère des statistiques détaillées sur :
   * - Répartition des livres par genre
   * - Nombre d'emprunts par genre
   * - Notes moyennes par genre
   * - Popularité des différentes catégories
   * 
   * @param {string} period - Période d'analyse en jours (30, 90, 365, etc.)
   * @returns {Promise<Array>} Tableau des analyses par genre
   */
  static async getBooksAnalytics(period) {
    return new Promise((resolve, reject) => {
      console.log(`📚 Analytics: Analyse des livres pour la période: ${period} jours`);
      
      const query = `
        SELECT 
          l.genre,
          COUNT(l.id) as nombre_livres,
          COUNT(e.id) as nombre_emprunts,
          ROUND(AVG(c.note), 2) as note_moyenne,
          COUNT(c.id) as nombre_commentaires
        FROM livres l
        LEFT JOIN emprunts e ON l.id = e.livre_id 
          AND e.date_emprunt >= DATE_SUB(NOW(), INTERVAL ? DAY)
        LEFT JOIN commentaires c ON l.id = c.livre_id
          AND c.date_commentaire >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY l.genre
        ORDER BY nombre_emprunts DESC
      `;
      
      connection.query(query, [period, period], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getUsersAnalytics(period) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          DATE(u.date_inscription) as date_inscription,
          COUNT(*) as nouveaux_utilisateurs,
          (SELECT COUNT(*) FROM emprunts e WHERE e.utilisateur_id = u.id 
           AND e.date_emprunt >= DATE_SUB(NOW(), INTERVAL ? DAY)) as emprunts_periode
        FROM utilisateurs u
        WHERE u.date_inscription >= DATE_SUB(NOW(), INTERVAL ? DAY)
          AND u.role = 'etudiant'
        GROUP BY DATE(u.date_inscription)
        ORDER BY date_inscription DESC
      `;
      
      connection.query(query, [period, period], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getBorrowsAnalytics(period) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          DATE(e.date_emprunt) as date_emprunt,
          COUNT(*) as nombre_emprunts,
          COUNT(CASE WHEN e.date_retour_effective IS NOT NULL THEN 1 END) as emprunts_rendus,
          COUNT(CASE WHEN e.date_retour_effective IS NULL AND e.date_retour_prevue < NOW() THEN 1 END) as emprunts_en_retard
        FROM emprunts e
        WHERE e.date_emprunt >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY DATE(e.date_emprunt)
        ORDER BY date_emprunt DESC
      `;
      
      connection.query(query, [period], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getTopBooks(limit, period) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          l.id,
          l.titre,
          l.auteur,
          l.genre,
          COUNT(e.id) as nombre_emprunts,
          ROUND(AVG(c.note), 2) as note_moyenne,
          COUNT(c.id) as nombre_commentaires
        FROM livres l
        LEFT JOIN emprunts e ON l.id = e.livre_id 
          AND e.date_emprunt >= DATE_SUB(NOW(), INTERVAL ? DAY)
        LEFT JOIN commentaires c ON l.id = c.livre_id
        GROUP BY l.id, l.titre, l.auteur, l.genre
        ORDER BY nombre_emprunts DESC, note_moyenne DESC
        LIMIT ?
      `;
      
      connection.query(query, [period, parseInt(limit)], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getActiveUsers(limit, period) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          u.id,
          u.nom,
          u.prenom,
          u.email,
          COUNT(e.id) as nombre_emprunts,
          COUNT(c.id) as nombre_commentaires,
          COUNT(r.id) as nombre_reservations,
          ROUND(AVG(c.note), 2) as note_moyenne_donnee
        FROM utilisateurs u
        LEFT JOIN emprunts e ON u.id = e.utilisateur_id 
          AND e.date_emprunt >= DATE_SUB(NOW(), INTERVAL ? DAY)
        LEFT JOIN commentaires c ON u.id = c.utilisateur_id
          AND c.date_commentaire >= DATE_SUB(NOW(), INTERVAL ? DAY)
        LEFT JOIN reservations r ON u.id = r.utilisateur_id
          AND r.date_reservation >= DATE_SUB(NOW(), INTERVAL ? DAY)
        WHERE u.role = 'etudiant'
        GROUP BY u.id, u.nom, u.prenom, u.email
        HAVING (nombre_emprunts > 0 OR nombre_commentaires > 0 OR nombre_reservations > 0)
        ORDER BY nombre_emprunts DESC, nombre_commentaires DESC
        LIMIT ?
      `;
      
      connection.query(query, [period, period, period, parseInt(limit)], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getMonthlyTrends(year) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          MONTH(date_emprunt) as mois,
          MONTHNAME(date_emprunt) as nom_mois,
          COUNT(*) as emprunts,
          (SELECT COUNT(*) FROM utilisateurs u2 WHERE YEAR(u2.date_inscription) = ? AND MONTH(u2.date_inscription) = MONTH(e.date_emprunt)) as nouveaux_utilisateurs,
          (SELECT COUNT(*) FROM commentaires c2 WHERE YEAR(c2.date_commentaire) = ? AND MONTH(c2.date_commentaire) = MONTH(e.date_emprunt)) as commentaires
        FROM emprunts e
        WHERE YEAR(e.date_emprunt) = ?
        GROUP BY MONTH(e.date_emprunt), MONTHNAME(e.date_emprunt)
        ORDER BY mois
      `;
      
      connection.query(query, [year, year, year], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getGenreStats() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          l.genre,
          COUNT(l.id) as nombre_livres,
          COUNT(e.id) as total_emprunts,
          ROUND(AVG(c.note), 2) as note_moyenne,
          COUNT(DISTINCT c.utilisateur_id) as utilisateurs_uniques
        FROM livres l
        LEFT JOIN emprunts e ON l.id = e.livre_id
        LEFT JOIN commentaires c ON l.id = c.livre_id
        GROUP BY l.genre
        ORDER BY total_emprunts DESC
      `;
      
      connection.query(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = Analytics;
