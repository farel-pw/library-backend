const mysql = require('mysql2');
const connection = require('../config/database');

class Comment {
  static async findByBookId(bookId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, u.nom, u.prenom 
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
}

module.exports = Comment;
