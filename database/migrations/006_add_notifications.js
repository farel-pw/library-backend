const mysql = require('mysql2');

class Migration006AddNotifications {
  static async up(connection) {
    console.log('🔄 Migration 006: Ajout du système de notifications...');
    
    try {
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
      await connection.execute(createNotificationsTable);
      console.log('✅ Table notifications créée');

      // Ajouter une colonne pour la dernière notification dans la table emprunts
      const addLastNotificationColumn = `
        ALTER TABLE emprunts 
        ADD COLUMN derniere_notification TIMESTAMP NULL
      `;
      try {
        await connection.execute(addLastNotificationColumn);
        console.log('✅ Colonne derniere_notification ajoutée à la table emprunts');
      } catch (error) {
        if (error.code !== 'ER_DUP_FIELDNAME') {
          throw error;
        }
        console.log('ℹ️ Colonne derniere_notification existe déjà');
      }

      // Ajouter des paramètres de notification par défaut
      const insertDefaultSettings = `
        INSERT IGNORE INTO settings (cle, valeur, description) VALUES
        ('notification_email_enabled', 'true', 'Activer les notifications par email'),
        ('notification_retard_enabled', 'true', 'Activer les notifications de retard'),
        ('notification_reservation_enabled', 'true', 'Activer les notifications de réservation'),
        ('smtp_host', 'smtp.gmail.com', 'Serveur SMTP'),
        ('smtp_port', '587', 'Port SMTP'),
        ('smtp_user', '', 'Utilisateur SMTP'),
        ('smtp_pass', '', 'Mot de passe SMTP'),
        ('library_email', 'noreply@bibliotheque.com', 'Email de la bibliothèque'),
        ('library_name', 'Bibliothèque Universitaire', 'Nom de la bibliothèque')
      `;
      
      try {
        await connection.execute(insertDefaultSettings);
        console.log('✅ Paramètres de notification par défaut ajoutés');
      } catch (error) {
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
        await connection.execute(createSettingsTable);
        console.log('✅ Table settings créée');
        
        await connection.execute(insertDefaultSettings);
        console.log('✅ Paramètres de notification par défaut ajoutés');
      }

      console.log('✅ Migration 006 terminée avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur migration 006:', error);
      throw error;
    }
  }

  static async down(connection) {
    console.log('🔄 Rollback migration 006...');
    
    try {
      // Supprimer la colonne derniere_notification
      const dropLastNotificationColumn = `
        ALTER TABLE emprunts 
        DROP COLUMN derniere_notification
      `;
      try {
        await connection.execute(dropLastNotificationColumn);
        console.log('✅ Colonne derniere_notification supprimée');
      } catch (error) {
        console.log('ℹ️ Colonne derniere_notification n\'existe pas');
      }

      // Supprimer la table notifications
      await connection.execute('DROP TABLE IF EXISTS notifications');
      console.log('✅ Table notifications supprimée');

      // Supprimer les paramètres de notification
      const deleteSettings = `
        DELETE FROM settings 
        WHERE cle IN (
          'notification_email_enabled',
          'notification_retard_enabled', 
          'notification_reservation_enabled',
          'smtp_host',
          'smtp_port',
          'smtp_user',
          'smtp_pass',
          'library_email',
          'library_name'
        )
      `;
      await connection.execute(deleteSettings);
      console.log('✅ Paramètres de notification supprimés');

      console.log('✅ Rollback migration 006 terminé');
      return true;
    } catch (error) {
      console.error('❌ Erreur rollback migration 006:', error);
      throw error;
    }
  }
}

module.exports = Migration006AddNotifications;
