const mysql = require('mysql2');
const connection = require('../config/database');

class Borrow {
  static async findAllWithDetails() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT e.*, u.nom, u.prenom, u.email, l.titre, l.auteur, l.isbn
        FROM emprunts e
        JOIN utilisateurs u ON e.utilisateur_id = u.id
        JOIN livres l ON e.livre_id = l.id
        ORDER BY e.date_emprunt DESC
      `;
      
      connection.query(query, (err, rows) => {
        if (err) reject(err);
        else {
          // Transformer les données pour correspondre au format attendu par le frontend
          const transformedRows = rows.map(row => ({
            id: row.id,
            utilisateur_id: row.utilisateur_id,
            livre_id: row.livre_id,
            utilisateur: {
              nom: row.nom,
              prenom: row.prenom,
              email: row.email
            },
            livre: {
              titre: row.titre,
              auteur: row.auteur,
              isbn: row.isbn
            },
            date_emprunt: row.date_emprunt,
            date_retour_prevue: row.date_retour_prevue,
            date_retour_effective: row.date_retour_effective,
            statut: row.date_retour_effective ? 'rendu' : 
                   (new Date(row.date_retour_prevue) < new Date() ? 'en_retard' : 'en_cours'),
            penalites: row.penalites || 0,
            notes_admin: row.notes_admin
          }));
          resolve(transformedRows);
        }
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

  static async findAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT e.*, u.nom, u.prenom, u.email, l.titre, l.auteur, l.isbn
        FROM emprunts e
        JOIN utilisateurs u ON e.utilisateur_id = u.id
        JOIN livres l ON e.livre_id = l.id
        ORDER BY e.date_emprunt DESC
      `;
      
      connection.query(query, (err, rows) => {
        if (err) reject(err);
        else {
          // Transformer les données pour correspondre au format attendu par le frontend
          const transformedRows = rows.map(row => ({
            id: row.id,
            utilisateur_id: row.utilisateur_id,
            livre_id: row.livre_id,
            utilisateur: {
              nom: row.nom,
              prenom: row.prenom,
              email: row.email
            },
            livre: {
              titre: row.titre,
              auteur: row.auteur,
              isbn: row.isbn
            },
            date_emprunt: row.date_emprunt,
            date_retour_prevue: row.date_retour_prevue,
            date_retour_effective: row.date_retour_effective,
            statut: row.date_retour_effective ? 'rendu' : 
                   (new Date(row.date_retour_prevue) < new Date() ? 'en_retard' : 'en_cours'),
            penalites: row.penalites || 0,
            notes_admin: row.notes_admin
          }));
          resolve(transformedRows);
        }
      });
    });
  }

  static async create(borrowData) {
    return new Promise((resolve, reject) => {
      const query = "INSERT INTO emprunts SET ?";
      connection.query(query, borrowData, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async update(id, updateData) {
    return new Promise((resolve, reject) => {
      const query = "UPDATE emprunts SET ? WHERE id = ?";
      connection.query(query, [updateData, id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async isBookBorrowed(bookId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(*) as count 
        FROM emprunts 
        WHERE livre_id = ? AND date_retour_effective IS NULL
      `;
      
      connection.query(query, [bookId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows[0].count > 0);
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

  static async findById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT e.*, l.titre, l.auteur 
        FROM emprunts e
        JOIN livres l ON e.livre_id = l.id
        WHERE e.id = ?
      `;
      
      connection.query(query, [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.length > 0 ? rows[0] : null);
      });
    });
  }
}

module.exports = Borrow;
