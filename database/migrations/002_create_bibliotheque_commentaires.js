const mysql = require('mysql2');
const config = require('../../src/config/database');

const connection = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database
});

async function createBibliothequeCommentairesTable() {
  return new Promise((resolve, reject) => {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS bibliotheque_commentaires (
        id INT AUTO_INCREMENT PRIMARY KEY,
        utilisateur_id INT NOT NULL,
        commentaire TEXT NOT NULL,
        note INT CHECK (note >= 1 AND note <= 5),
        date_commentaire TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `;

    connection.query(createTableQuery, (err, result) => {
      if (err) {
        console.error('Erreur lors de la création de la table bibliotheque_commentaires:', err);
        reject(err);
      } else {
        console.log('Table bibliotheque_commentaires créée avec succès');
        resolve(result);
      }
    });
  });
}

async function runMigration() {
  try {
    await createBibliothequeCommentairesTable();
    console.log('Migration terminée avec succès');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    process.exit(1);
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  runMigration();
}

module.exports = { createBibliothequeCommentairesTable };
