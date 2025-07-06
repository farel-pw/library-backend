const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bibliotheque',
  port: parseInt(process.env.DB_PORT) || 3306
});

async function createNotificationTables() {
  console.log('🔄 Création des tables de notifications...');
  
  try {
    await connection.promise().connect();
    console.log('✅ Connexion établie');

    // Créer la table notifications
    const createNotificationsTable = `
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        utilisateur_id INT NOT NULL,
        type ENUM('emprunt_retard', 'reservation_validee', 'reservation_expiree', 'nouveau_livre', 'maintenance') NOT NULL,
        titre VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        lu BOOLEAN DEFAULT FALSE,
        email_sent BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
        INDEX idx_utilisateur_lu (utilisateur_id, lu),
        INDEX idx_type_created (type, created_at)
      )
    `;
    await connection.promise().execute(createNotificationsTable);
    console.log('✅ Table notifications créée');

    // Ajouter une colonne pour la dernière notification dans la table emprunts
    try {
      const addLastNotificationColumn = `
        ALTER TABLE emprunts 
        ADD COLUMN derniere_notification TIMESTAMP NULL
      `;
      await connection.promise().execute(addLastNotificationColumn);
      console.log('✅ Colonne derniere_notification ajoutée à la table emprunts');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ Colonne derniere_notification existe déjà');
      } else {
        throw error;
      }
    }

    // Créer la table settings si elle n'existe pas
    const createSettingsTable = `
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cle VARCHAR(100) UNIQUE NOT NULL,
        valeur TEXT,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await connection.promise().execute(createSettingsTable);
    console.log('✅ Table settings créée/vérifiée');

    // Ajouter des paramètres de notification par défaut
    const settings = [
      ['notification_email_enabled', 'true', 'Activer les notifications par email'],
      ['notification_retard_enabled', 'true', 'Activer les notifications de retard'],
      ['notification_reservation_enabled', 'true', 'Activer les notifications de réservation'],
      ['smtp_host', 'smtp.gmail.com', 'Serveur SMTP'],
      ['smtp_port', '587', 'Port SMTP'],
      ['smtp_user', '', 'Utilisateur SMTP'],
      ['smtp_pass', '', 'Mot de passe SMTP'],
      ['library_email', 'noreply@bibliotheque.com', 'Email de la bibliothèque'],
      ['library_name', 'Bibliothèque Universitaire', 'Nom de la bibliothèque']
    ];
    
    for (const [cle, valeur, description] of settings) {
      const insertSetting = `
        INSERT IGNORE INTO settings (cle, valeur, description) 
        VALUES (?, ?, ?)
      `;
      await connection.promise().execute(insertSetting, [cle, valeur, description]);
    }
    console.log('✅ Paramètres de notification par défaut ajoutés');

    console.log('🎉 Tables de notifications créées avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    connection.end();
  }
}

createNotificationTables();
