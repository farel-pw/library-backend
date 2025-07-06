const mysql = require('mysql2');
const connection = require('../config/database');

class Notification {
  static async create(notificationData) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO notifications (utilisateur_id, type, titre, message, email_sent, created_at) 
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
      const values = [
        notificationData.utilisateur_id,
        notificationData.type,
        notificationData.titre,
        notificationData.message,
        notificationData.email_sent || false
      ];

      connection.query(query, values, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async findByUserId(userId, limit = 50) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM notifications 
        WHERE utilisateur_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `;
      connection.query(query, [userId, limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async findUnreadByUserId(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM notifications 
        WHERE utilisateur_id = ? AND lu = FALSE 
        ORDER BY created_at DESC
      `;
      connection.query(query, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async markAsRead(id) {
    return new Promise((resolve, reject) => {
      const query = "UPDATE notifications SET lu = TRUE WHERE id = ?";
      connection.query(query, [id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async markAllAsRead(userId) {
    return new Promise((resolve, reject) => {
      const query = "UPDATE notifications SET lu = TRUE WHERE utilisateur_id = ?";
      connection.query(query, [userId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      const query = "DELETE FROM notifications WHERE id = ?";
      connection.query(query, [id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async getStats() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN lu = FALSE THEN 1 ELSE 0 END) as non_lues,
          SUM(CASE WHEN email_sent = TRUE THEN 1 ELSE 0 END) as emails_envoyes,
          COUNT(DISTINCT utilisateur_id) as utilisateurs_notifies
        FROM notifications
      `;
      connection.query(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows[0]);
      });
    });
  }

  static async findAll(limit = 100) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          n.*,
          u.nom,
          u.prenom,
          u.email
        FROM notifications n
        LEFT JOIN utilisateurs u ON n.utilisateur_id = u.id
        ORDER BY n.created_at DESC
        LIMIT ?
      `;
      connection.query(query, [limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Trouver les emprunts en retard
  static async findOverdueBorrows() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          e.*,
          u.nom,
          u.prenom,
          u.email,
          l.titre,
          l.auteur,
          l.isbn,
          DATEDIFF(CURDATE(), e.date_retour_prevue) as jours_retard
        FROM emprunts e
        JOIN utilisateurs u ON e.utilisateur_id = u.id
        JOIN livres l ON e.livre_id = l.id
        WHERE e.rendu = FALSE 
        AND e.date_retour_prevue < CURDATE()
        ORDER BY e.date_retour_prevue ASC
      `;
      connection.query(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Marquer un emprunt comme ayant été notifié pour retard
  static async markBorrowAsNotified(borrowId) {
    return new Promise((resolve, reject) => {
      const query = "UPDATE emprunts SET derniere_notification = NOW() WHERE id = ?";
      connection.query(query, [borrowId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  // Vérifier si un emprunt a déjà été notifié récemment (dans les dernières 24h)
  static async wasRecentlyNotified(borrowId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT derniere_notification 
        FROM emprunts 
        WHERE id = ? 
        AND derniere_notification > DATE_SUB(NOW(), INTERVAL 24 HOUR)
      `;
      connection.query(query, [borrowId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.length > 0);
      });
    });
  }
}

module.exports = Notification;
