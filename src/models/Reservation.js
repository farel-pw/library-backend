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

  static async findAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT r.*, u.nom, u.prenom, u.email, l.titre, l.auteur, l.isbn
        FROM reservations r
        JOIN utilisateurs u ON r.utilisateur_id = u.id
        JOIN livres l ON r.livre_id = l.id
        ORDER BY r.date_reservation DESC
      `;
      
      connection.query(query, (err, rows) => {
        if (err) {
          console.error("❌ Reservations SQL Error:", err);
          reject(err);
        } else {
          console.log("✅ Reservations SQL Result:", rows.length, "reservations found");
          // Transformer les données pour correspondre au format attendu par le frontend
          const transformedReservations = rows.map(reservation => ({
            id: reservation.id,
            utilisateur_id: reservation.utilisateur_id,
            livre_id: reservation.livre_id,
            utilisateur: {
              nom: reservation.nom,
              prenom: reservation.prenom,
              email: reservation.email
            },
            livre: {
              titre: reservation.titre,
              auteur: reservation.auteur,
              isbn: reservation.isbn
            },
            date_reservation: reservation.date_reservation,
            statut: reservation.statut,
            notes_admin: reservation.notes_admin,
            date_expiration: reservation.date_expiration
          }));
          resolve(transformedReservations);
        }
      });
    });
  }

  static async findAllWithDetails() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT r.*, 
               u.nom, u.prenom, u.email, 
               l.titre, l.auteur, l.isbn,
               (SELECT COUNT(*) FROM reservations r2 
                WHERE r2.livre_id = r.livre_id 
                AND r2.statut = 'en_attente' 
                AND r2.date_reservation < r.date_reservation) + 1 as position
        FROM reservations r
        JOIN utilisateurs u ON r.utilisateur_id = u.id
        JOIN livres l ON r.livre_id = l.id
        ORDER BY r.date_reservation DESC
      `;
      
      connection.query(query, (err, rows) => {
        if (err) {
          console.error("❌ Reservations with details SQL Error:", err);
          reject(err);
        } else {
          console.log("✅ Reservations with details SQL Result:", rows.length, "reservations found");
          const transformedReservations = rows.map(reservation => ({
            id: reservation.id,
            utilisateur_id: reservation.utilisateur_id,
            livre_id: reservation.livre_id,
            utilisateur: {
              nom: reservation.nom,
              prenom: reservation.prenom,
              email: reservation.email
            },
            livre: {
              titre: reservation.titre,
              auteur: reservation.auteur,
              isbn: reservation.isbn
            },
            date_reservation: reservation.date_reservation,
            statut: reservation.statut,
            notes_admin: reservation.notes_admin,
            date_expiration: reservation.date_expiration,
            position: reservation.position
          }));
          resolve(transformedReservations);
        }
      });
    });
  }

  static async update(id, updateData) {
    return new Promise((resolve, reject) => {
      const query = "UPDATE reservations SET ? WHERE id = ?";
      connection.query(query, [updateData, id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
}

module.exports = Reservation;
