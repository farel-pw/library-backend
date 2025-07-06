const mysql = require('mysql2');
const connection = require('../config/database');

class Comment {
  static async findByBookId(bookId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, u.nom as utilisateur_nom, u.prenom as utilisateur_prenom 
        FROM commentaires c
        JOIN utilisateurs u ON c.utilisateur_id = u.id
        WHERE c.livre_id = ?
        ORDER BY c.date_commentaire DESC
      `;
      
      connection.query(query, [bookId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async create(commentData) {
    return new Promise((resolve, reject) => {
      const query = "INSERT INTO ?? SET ?";
      const table = ["commentaires"];
      const formattedQuery = mysql.format(query, table);
      
      connection.query(formattedQuery, commentData, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async updateNote(commentData) {
    return new Promise((resolve, reject) => {
      const query = "UPDATE ?? SET ? WHERE ?? = ? AND ?? = ?";
      const table = ["commentaires", "utilisateur_id", commentData.utilisateur_id, "livre_id", commentData.livre_id];
      const formattedQuery = mysql.format(query, table);
      
      connection.query(formattedQuery, { note: commentData.note }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      const query = "DELETE FROM ?? WHERE ?? = ?";
      const table = ["commentaires", "id", id];
      const formattedQuery = mysql.format(query, table);
      
      connection.query(formattedQuery, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async findBibliothequeComments() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT bc.*, u.nom as utilisateur_nom, u.prenom as utilisateur_prenom 
        FROM bibliotheque_commentaires bc
        JOIN utilisateurs u ON bc.utilisateur_id = u.id
        ORDER BY bc.date_commentaire DESC
      `;
      
      connection.query(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async createBibliothequeComment(commentData) {
    return new Promise((resolve, reject) => {
      const query = "INSERT INTO ?? SET ?";
      const table = ["bibliotheque_commentaires"];
      const formattedQuery = mysql.format(query, table);
      
      connection.query(formattedQuery, commentData, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async getBibliothequeStats() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) as total_commentaires,
          AVG(note) as note_moyenne,
          COUNT(CASE WHEN note >= 4 THEN 1 END) as notes_positives,
          COUNT(CASE WHEN note <= 2 THEN 1 END) as notes_negatives
        FROM bibliotheque_commentaires 
        WHERE note IS NOT NULL
      `;
      
      connection.query(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows[0]);
      });
    });
  }

  static async findByUserId(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, l.titre, l.auteur, l.isbn
        FROM commentaires c
        JOIN livres l ON c.livre_id = l.id
        WHERE c.utilisateur_id = ?
        ORDER BY c.date_commentaire DESC
      `;
      
      connection.query(query, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = Comment;
