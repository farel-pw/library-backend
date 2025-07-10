const mysql = require('mysql2/promise');

async function createNotificationsTable() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'bibliotheque'
    });

    console.log('📧 Création de la table notifications...');

    // Créer la table notifications
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        utilisateur_id INT NOT NULL,
        titre VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('info', 'emprunt_retard', 'reservation_validee', 'livre_disponible') DEFAULT 'info',
        lu BOOLEAN DEFAULT FALSE,
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_lecture TIMESTAMP NULL,
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Table notifications créée');

    // Créer les index
    try {
      await connection.execute('CREATE INDEX idx_notifications_utilisateur ON notifications(utilisateur_id)');
      await connection.execute('CREATE INDEX idx_notifications_lu ON notifications(lu)');
      await connection.execute('CREATE INDEX idx_notifications_type ON notifications(type)');
      console.log('✅ Index créés');
    } catch (indexError) {
      if (indexError.code !== 'ER_DUP_KEYNAME') {
        console.log('ℹ️  Index déjà existants');
      }
    }

    // Ajouter quelques notifications de test
    await connection.execute(`
      INSERT IGNORE INTO notifications (utilisateur_id, titre, message, type) VALUES
      (1, 'Bienvenue', 'Bienvenue dans le système de bibliothèque !', 'info'),
      (1, 'Test', 'Notification de test pour validation du système', 'info')
    `);

    console.log('✅ Notifications de test ajoutées');

    await connection.end();
    console.log('🎉 Table notifications configurée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la création de la table notifications:', error.message);
  }
}

createNotificationsTable();
