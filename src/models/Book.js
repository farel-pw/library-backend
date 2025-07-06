const mysql = require('mysql2');
const connection = require('../config/database');

class Book {
  static async findAll() {
    return new Promise((resolve, reject) => {
      // Requête de base simple
      const query = "SELECT * FROM livres ORDER BY id DESC";
      
      console.log("🔍 Books SQL Query:", query);
      
      connection.query(query, (err, rows) => {
        if (err) {
          console.error("❌ Books SQL Error:", err);
          reject(err);
        } else {
          console.log("✅ Books SQL Result:", rows.length, "books found");
          if (rows.length > 0) {
            console.log("📋 Sample book data:", JSON.stringify(rows[0], null, 2));
          }
          
          // Transformer les données pour correspondre au format attendu par le frontend
          const transformedBooks = rows.map(book => ({
            ...book,
            // Ajouter les champs manquants attendus par le frontend
            exemplaires_total: 1, // Pour l'instant, on considère 1 exemplaire par livre
            exemplaires_disponibles: book.disponible === 1 ? 1 : 0,
            statut: book.disponible === 1 ? 'disponible' : 'indisponible',
            editeur: book.editeur || 'Non spécifié',
            date_ajout: book.date_ajout || new Date().toISOString(),
            note_moyenne: book.note_moyenne || 0,
            nombre_avis: book.nombre_avis || 0,
            emprunts_total: book.emprunts_total || 0,
            reservations_actives: book.reservations_actives || 0
          }));
          
          console.log("� Transformed book sample:", JSON.stringify(transformedBooks[0], null, 2));
          resolve(transformedBooks);
        }
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM ?? WHERE ?? = ?";
      const table = ["livres", "id", id];
      const formattedQuery = mysql.format(query, table);
      
      connection.query(formattedQuery, (err, rows) => {
        if (err) reject(err);
        else resolve(rows[0]);
      });
    });
  }

  static async findByIsbn(isbn) {
    return new Promise((resolve, reject) => {
      const query = "SELECT isbn FROM ?? WHERE ?? = ?";
      const table = ["livres", "isbn", isbn];
      const formattedQuery = mysql.format(query, table);
      
      connection.query(formattedQuery, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async create(bookData) {
    return new Promise((resolve, reject) => {
      const query = "INSERT INTO ?? SET ?";
      const table = ["livres"];
      const formattedQuery = mysql.format(query, table);
      
      connection.query(formattedQuery, bookData, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async update(id, bookData) {
    return new Promise((resolve, reject) => {
      const query = "UPDATE ?? SET ? WHERE ?? = ?";
      const values = ["livres", bookData, "id", id];
      const formattedQuery = mysql.format(query, values);
      
      console.log("🔄 Update book SQL:", formattedQuery);
      
      connection.query(formattedQuery, (err, result) => {
        if (err) {
          console.error("❌ Update book SQL Error:", err);
          reject(err);
        } else {
          console.log("✅ Update book result:", result);
          resolve(result);
        }
      });
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      const query = "DELETE FROM ?? WHERE ?? = ?";
      const values = ["livres", "id", id];
      const formattedQuery = mysql.format(query, values);
      
      console.log("🗑️ Delete book SQL:", formattedQuery);
      
      connection.query(formattedQuery, (err, result) => {
        if (err) {
          console.error("❌ Delete book SQL Error:", err);
          reject(err);
        } else {
          console.log("✅ Delete book result:", result);
          resolve(result);
        }
      });
    });
  }
}

module.exports = Book;
