const mysql = require('mysql2');
const connection = require('../config/database');

class Borrow {
  static async findAllWithDetails() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT e.*, u.nom, u.prenom, l.titre, l.auteur 
        FROM emprunts e
        JOIN utilisateurs u ON e.utilisateur_id = u.id
        JOIN livres l ON e.livre_id = l.id
        ORDER BY e.date_emprunt DESC
      `;
      
      connection.query(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async findByUserId(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT e.*, l.titre, l.auteur 
        FROM emprunts e
        JOIN livres l ON e.livre_id = l.id
        WHERE e.utilisateur_id = ?
        ORDER BY e.date_emprunt DESC
      `;
      
      connection.query(query, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async findByUserIdNotReturned(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT e.*, l.titre, l.auteur 
        FROM emprunts e
        JOIN livres l ON e.livre_id = l.id
        WHERE e.utilisateur_id = ? AND e.date_retour_effective IS NULL
        ORDER BY e.date_emprunt DESC
      `;
      
      connection.query(query, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async isBookBorrowed(bookId) {
    return new Promise((resolve, reject) => {
      const query = "SELECT COUNT(*) as count FROM ?? WHERE ?? = ? AND ?? IS NULL";
      const table = ["emprunts", "livre_id", bookId, "date_retour_effective"];
      const formattedQuery = mysql.format(query, table);
      
      connection.query(formattedQuery, (err, rows) => {
        if (err) reject(err);
        else resolve(rows[0].count > 0);
      });
    });
  }

  static async create(borrowData) {
    return new Promise((resolve, reject) => {
      const query = "INSERT INTO ?? SET ?";
      const table = ["emprunts"];
      const formattedQuery = mysql.format(query, table);
      
      connection.query(formattedQuery, borrowData, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async returnBook(id) {
    return new Promise((resolve, reject) => {
      const query = "UPDATE ?? SET ?? = NOW() WHERE ?? = ?";
      const table = ["emprunts", "date_retour_effective", "id", id];
      const formattedQuery = mysql.format(query, table);
      
      connection.query(formattedQuery, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async findReturned() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT e.*, u.nom, u.prenom, l.titre, l.auteur 
        FROM emprunts e
        JOIN utilisateurs u ON e.utilisateur_id = u.id
        JOIN livres l ON e.livre_id = l.id
        WHERE e.date_retour_effective IS NOT NULL
        ORDER BY e.date_retour_effective DESC
      `;
      
      connection.query(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = Borrow;
