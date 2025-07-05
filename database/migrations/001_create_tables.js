const mysql = require('mysql2/promise');

const migration = {
  up: async (connection) => {
    console.log('🚀 Création des tables...');

    // Table utilisateurs
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS utilisateurs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        mot_de_passe VARCHAR(255) NOT NULL,
        useractive TINYINT(1) NOT NULL DEFAULT 1,
        date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        date_maj DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        role ENUM('etudiant', 'admin') DEFAULT 'etudiant'
      ) ENGINE=InnoDB
    `);
    console.log('✅ Table utilisateurs créée');

    // Table livres
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS livres (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titre VARCHAR(150) NOT NULL,
        auteur VARCHAR(100) NOT NULL,
        genre VARCHAR(50),
        isbn VARCHAR(13) UNIQUE,
        annee_publication YEAR,
        image_url VARCHAR(255) COMMENT 'URL de la couverture du livre',
        description TEXT COMMENT 'Description complète du livre',
        disponible TINYINT(1) DEFAULT 1
      ) ENGINE=InnoDB
    `);
    console.log('✅ Table livres créée');

    // Table emprunts
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS emprunts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        utilisateur_id INT NOT NULL,
        livre_id INT NOT NULL,
        date_emprunt DATE NOT NULL,
        date_retour_prevue DATE NOT NULL,
        date_retour_effective DATE,
        rendu BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
        FOREIGN KEY (livre_id) REFERENCES livres(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('✅ Table emprunts créée');

    // Table commentaires
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS commentaires (
        id INT AUTO_INCREMENT PRIMARY KEY,
        utilisateur_id INT NOT NULL,
        livre_id INT NOT NULL,
        note TINYINT CHECK (note BETWEEN 1 AND 5),
        commentaire TEXT,
        date_publication DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
        FOREIGN KEY (livre_id) REFERENCES livres(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('✅ Table commentaires créée');

    // Table réservations
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reservations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        utilisateur_id INT NOT NULL,
        livre_id INT NOT NULL,
        date_reservation DATETIME DEFAULT CURRENT_TIMESTAMP,
        statut ENUM('en_attente', 'annulée', 'validée') DEFAULT 'en_attente',
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
        FOREIGN KEY (livre_id) REFERENCES livres(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('✅ Table réservations créée');

    // Table logs
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        utilisateur_id INT,
        action TEXT,
        date_log DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `);
    console.log('✅ Table logs créée');

    // Création des index
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_email ON utilisateurs(email)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_titre ON livres(titre)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_emprunts_utilisateur ON emprunts(utilisateur_id)');
    console.log('✅ Index créés');

    console.log('🎉 Migration terminée avec succès !');
  },

  down: async (connection) => {
    console.log('🔄 Suppression des tables...');

    // Supprimer les tables dans l'ordre inverse (à cause des clés étrangères)
    // Les index seront automatiquement supprimés avec les tables
    await connection.execute('DROP TABLE IF EXISTS logs');
    await connection.execute('DROP TABLE IF EXISTS reservations');
    await connection.execute('DROP TABLE IF EXISTS commentaires');
    await connection.execute('DROP TABLE IF EXISTS emprunts');
    await connection.execute('DROP TABLE IF EXISTS livres');
    await connection.execute('DROP TABLE IF EXISTS utilisateurs');

    console.log('✅ Toutes les tables ont été supprimées');
  }
};

module.exports = migration;
