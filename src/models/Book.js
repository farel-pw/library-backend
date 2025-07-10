const mysql = require('mysql2');
const connection = require('../config/database');

class Book {
  static async findAll() {
    return new Promise((resolve, reject) => {
      // Requête avec comptage des emprunts actifs, retournés et réservations pour calculer la disponibilité
      const query = `
        SELECT 
          l.*,
          3 as exemplaires_total,
          GREATEST(0, 3 - COALESCE(emprunts_actifs.count, 0)) as exemplaires_disponibles,
          COALESCE(emprunts_actifs.count, 0) as emprunts_actifs,
          COALESCE(emprunts_retournes.count, 0) as emprunts_retournes,
          COALESCE(emprunts_totaux.count, 0) as emprunts_totaux,
          COALESCE(reservations_actives.count, 0) as reservations_actives,
          CASE 
            WHEN GREATEST(0, 3 - COALESCE(emprunts_actifs.count, 0)) > 0 THEN 'disponible'
            WHEN COALESCE(reservations_actives.count, 0) > 0 THEN 'reservable'
            ELSE 'indisponible' 
          END as statut
        FROM livres l
        LEFT JOIN (
          SELECT 
            livre_id, 
            COUNT(*) as count 
          FROM emprunts 
          WHERE date_retour_effective IS NULL 
          GROUP BY livre_id
        ) emprunts_actifs ON l.id = emprunts_actifs.livre_id
        LEFT JOIN (
          SELECT 
            livre_id, 
            COUNT(*) as count 
          FROM emprunts 
          WHERE date_retour_effective IS NOT NULL 
          GROUP BY livre_id
        ) emprunts_retournes ON l.id = emprunts_retournes.livre_id
        LEFT JOIN (
          SELECT 
            livre_id, 
            COUNT(*) as count 
          FROM emprunts 
          GROUP BY livre_id
        ) emprunts_totaux ON l.id = emprunts_totaux.livre_id
        LEFT JOIN (
          SELECT 
            livre_id, 
            COUNT(*) as count 
          FROM reservations 
          WHERE statut = 'active'
          GROUP BY livre_id
        ) reservations_actives ON l.id = reservations_actives.livre_id
        ORDER BY l.id DESC
      `;
      
      console.log("🔍 Books SQL Query with availability:", query);
      
      connection.query(query, (err, rows) => {
        if (err) {
          console.error("❌ Books SQL Error:", err);
          reject(err);
        } else {
          console.log("✅ Books SQL Result:", rows.length, "books found");
          if (rows.length > 0) {
            console.log("📋 Sample book data with availability:", JSON.stringify(rows[0], null, 2));
          }
          
          // Transformer les données pour correspondre au format attendu par le frontend
          const transformedBooks = rows.map(book => ({
            ...book,
            editeur: book.editeur || 'Non spécifié',
            date_ajout: book.date_ajout || new Date().toISOString(),
            note_moyenne: book.note_moyenne || 0,
            nombre_avis: book.nombre_avis || 0,
            // Utiliser les valeurs calculées
            disponible: book.exemplaires_disponibles > 0,
            peut_reserver: book.exemplaires_disponibles === 0 && book.reservations_actives >= 0
          }));
          
          console.log("📖 Transformed book sample:", JSON.stringify(transformedBooks[0], null, 2));
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
