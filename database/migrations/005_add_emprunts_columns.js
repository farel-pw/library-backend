const mysql = require('mysql2/promise');

const migration = {
  up: async (connection) => {
    console.log('🚀 Ajout des colonnes manquantes à la table emprunts...');

    // Ajouter les colonnes penalites et notes_admin
    try {
      await connection.execute(`
        ALTER TABLE emprunts 
        ADD COLUMN penalites DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Montant des pénalités en euros',
        ADD COLUMN notes_admin TEXT COMMENT 'Notes administratives sur l\'emprunt'
      `);
      console.log('✅ Colonnes penalites et notes_admin ajoutées');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ Les colonnes existent déjà');
      } else {
        throw error;
      }
    }

    // Mettre à jour le statut prete en prête (avec accent)
    try {
      await connection.execute(`
        ALTER TABLE reservations 
        MODIFY COLUMN statut ENUM('en_attente', 'annulée', 'validée', 'prete', 'prête') DEFAULT 'en_attente'
      `);
      console.log('✅ Enum statut des réservations mis à jour');
    } catch (error) {
      console.log('ℹ️ Enum déjà à jour ou erreur:', error.message);
    }

    console.log('🎉 Migration 005 terminée avec succès !');
  },

  down: async (connection) => {
    console.log('🔄 Suppression des colonnes ajoutées...');

    try {
      await connection.execute(`
        ALTER TABLE emprunts 
        DROP COLUMN penalites,
        DROP COLUMN notes_admin
      `);
      console.log('✅ Colonnes supprimées');
    } catch (error) {
      console.log('ℹ️ Erreur lors de la suppression:', error.message);
    }
  }
};

module.exports = migration;
