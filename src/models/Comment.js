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
        ORDER BY c.date_publication DESC
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
        ORDER BY c.date_publication DESC
      `;
      
      connection.query(query, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async findAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, u.nom, u.prenom, u.email, l.titre, l.auteur, l.isbn
        FROM commentaires c
        JOIN utilisateurs u ON c.utilisateur_id = u.id
        JOIN livres l ON c.livre_id = l.id
        ORDER BY c.date_publication DESC
      `;
      
      connection.query(query, (err, rows) => {
        if (err) {
          console.error("❌ Comments SQL Error:", err);
          reject(err);
        } else {
          console.log("✅ Comments SQL Result:", rows.length, "comments found");
          // Transformer les données pour correspondre au format attendu par le frontend
          const transformedComments = rows.map(comment => ({
            id: comment.id,
            utilisateur_id: comment.utilisateur_id,
            livre_id: comment.livre_id,
            utilisateur: {
              nom: comment.nom,
              prenom: comment.prenom,
              email: comment.email
            },
            livre: {
              titre: comment.titre,
              auteur: comment.auteur,
              isbn: comment.isbn
            },
            commentaire: comment.commentaire,
            note: comment.note,
            date_commentaire: comment.date_publication,
            statut: comment.statut || 'en_attente',
            date_moderation: comment.date_moderation,
            notes_moderation: comment.notes_moderation
          }));
          resolve(transformedComments);
        }
      });
    });
  }

  static async findAllWithDetails() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, 
               u.nom, u.prenom, u.email, 
               l.titre, l.auteur, l.isbn,
               (SELECT AVG(note) FROM commentaires c2 WHERE c2.livre_id = c.livre_id AND c2.note IS NOT NULL) as note_moyenne_livre,
               (SELECT COUNT(*) FROM commentaires c3 WHERE c3.utilisateur_id = c.utilisateur_id) as commentaires_utilisateur
        FROM commentaires c
        JOIN utilisateurs u ON c.utilisateur_id = u.id
        JOIN livres l ON c.livre_id = l.id
        ORDER BY c.date_publication DESC
      `;
      
      connection.query(query, (err, rows) => {
        if (err) {
          console.error("❌ Comments with details SQL Error:", err);
          reject(err);
        } else {
          console.log("✅ Comments with details SQL Result:", rows.length, "comments found");
          const transformedComments = rows.map(comment => ({
            id: comment.id,
            utilisateur_id: comment.utilisateur_id,
            livre_id: comment.livre_id,
            utilisateur: {
              nom: comment.nom,
              prenom: comment.prenom,
              email: comment.email,
              total_commentaires: comment.commentaires_utilisateur
            },
            livre: {
              titre: comment.titre,
              auteur: comment.auteur,
              isbn: comment.isbn,
              note_moyenne: comment.note_moyenne_livre
            },
            commentaire: comment.commentaire,
            note: comment.note,
            date_commentaire: comment.date_publication,
            statut: comment.statut || 'en_attente',
            date_moderation: comment.date_moderation,
            notes_moderation: comment.notes_moderation
          }));
          resolve(transformedComments);
        }
      });
    });
  }

  static async getStats() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) as total_commentaires,
          COUNT(CASE WHEN note IS NOT NULL THEN 1 END) as total_notes,
          AVG(note) as note_moyenne_generale,
          COUNT(CASE WHEN DATE(date_publication) = CURDATE() THEN 1 END) as commentaires_aujourd_hui,
          COUNT(CASE WHEN date_publication >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as commentaires_semaine,
          COUNT(CASE WHEN date_publication >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as commentaires_mois,
          COUNT(CASE WHEN statut = 'en_attente' THEN 1 END) as en_attente_moderation,
          COUNT(CASE WHEN statut = 'approuve' THEN 1 END) as approuves,
          COUNT(CASE WHEN statut = 'rejete' THEN 1 END) as rejetes
        FROM commentaires
      `;
      
      connection.query(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows[0]);
      });
    });
  }

  static async findForModeration() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, u.nom, u.prenom, u.email, l.titre, l.auteur
        FROM commentaires c
        JOIN utilisateurs u ON c.utilisateur_id = u.id
        JOIN livres l ON c.livre_id = l.id
        WHERE c.statut = 'en_attente' OR c.statut IS NULL
        ORDER BY c.date_publication DESC
      `;
      
      connection.query(query, (err, rows) => {
        if (err) reject(err);
        else {
          const transformedComments = rows.map(comment => ({
            id: comment.id,
            utilisateur_id: comment.utilisateur_id,
            livre_id: comment.livre_id,
            utilisateur: {
              nom: comment.nom,
              prenom: comment.prenom,
              email: comment.email
            },
            livre: {
              titre: comment.titre,
              auteur: comment.auteur
            },
            commentaire: comment.commentaire,
            note: comment.note,
            date_commentaire: comment.date_publication,
            statut: comment.statut || 'en_attente'
          }));
          resolve(transformedComments);
        }
      });
    });
  }

  static async update(id, updateData) {
    return new Promise((resolve, reject) => {
      const query = "UPDATE commentaires SET ? WHERE id = ?";
      connection.query(query, [updateData, id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async adminDelete(id) {
    return new Promise((resolve, reject) => {
      const query = "DELETE FROM commentaires WHERE id = ?";
      connection.query(query, [id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
}

module.exports = Comment;
