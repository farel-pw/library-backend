const mysql = require('mysql2/promise');

async function up(connection) {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS bibliotheque_commentaires (
      id INT AUTO_INCREMENT PRIMARY KEY,
      utilisateur_id INT NOT NULL,
      commentaire TEXT NOT NULL,
      note INT CHECK (note >= 1 AND note <= 5),
      date_commentaire DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
    )
  `;

  try {
    await connection.execute(createTableQuery);
    console.log('Table bibliotheque_commentaires créée avec succès');
  } catch (error) {
    console.error('Erreur lors de la création de la table bibliotheque_commentaires:', error);
    throw error;
  }
}

async function down(connection) {
  const dropTableQuery = 'DROP TABLE IF EXISTS bibliotheque_commentaires';
  
  try {
    await connection.execute(dropTableQuery);
    console.log('Table bibliotheque_commentaires supprimée avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression de la table bibliotheque_commentaires:', error);
    throw error;
  }
}

module.exports = { up, down };
