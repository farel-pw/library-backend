const mysql = require('mysql2');
const connection = require('../config/database');

class Reservation {
  static async findByBook(bookId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT r.*, u.nom, u.prenom 
        FROM reservations r
        JOIN utilisateurs u ON r.utilisateur_id = u.id
        WHERE r.livre_id = ?
        ORDER BY r.date_reservation ASC
      `;
      
      connection.query(query, [bookId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async findByUserId(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT r.*, l.titre, l.auteur 
        FROM reservations r
        JOIN livres l ON r.livre_id = l.id
        WHERE r.utilisateur_id = ?
        ORDER BY r.date_reservation DESC
      `;
      
      connection.query(query, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async create(reservationData) {
    return new Promise((resolve, reject) => {
      const query = "INSERT INTO ?? SET ?";
      const table = ["reservations"];
      const formattedQuery = mysql.format(query, table);
      
      connection.query(formattedQuery, reservationData, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      const query = "DELETE FROM ?? WHERE ?? = ?";
      const table = ["reservations", "id", id];
      const formattedQuery = mysql.format(query, table);
      
      connection.query(formattedQuery, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async findByUserAndBook(userId, bookId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM reservations 
        WHERE utilisateur_id = ? AND livre_id = ? AND statut IN ('en_attente', 'validée')
      `;
      
      connection.query(query, [userId, bookId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.length > 0 ? rows[0] : null);
      });
    });
  }

  static async getPositionInQueue(bookId, reservationId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(*) + 1 as position
        FROM reservations 
        WHERE livre_id = ? 
        AND date_reservation < (
          SELECT date_reservation 
          FROM reservations 
          WHERE id = ?
        )
        AND statut = 'en_attente'
      `;
      
      connection.query(query, [bookId, reservationId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows[0].position);
      });
    });
  }

  static async getTotalReservationsForBook(bookId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(*) as total
        FROM reservations 
        WHERE livre_id = ? AND statut = 'en_attente'
      `;
      
      connection.query(query, [bookId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows[0].total);
      });
    });
  }

  static async getNextInQueue(bookId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT r.*, u.nom, u.prenom, u.email
        FROM reservations r
        JOIN utilisateurs u ON r.utilisateur_id = u.id
        WHERE r.livre_id = ? AND r.statut = 'en_attente'
        ORDER BY r.date_reservation ASC
        LIMIT 1
      `;
      
      connection.query(query, [bookId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.length > 0 ? rows[0] : null);
      });
    });
  }

  static async updateStatus(reservationId, newStatus) {
    return new Promise((resolve, reject) => {
      const query = "UPDATE reservations SET statut = ? WHERE id = ?";
      
      connection.query(query, [newStatus, reservationId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
}

module.exports = Reservation;
