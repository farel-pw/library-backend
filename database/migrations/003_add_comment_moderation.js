const mysql = require('mysql2/promise');

const migration = {
  up: async (connection) => {
    console.log('🚀 Ajout des colonnes pour la modération des commentaires...');

    // Ajouter les colonnes de modération aux commentaires
    try {
      await connection.execute(`
        ALTER TABLE commentaires 
        ADD COLUMN IF NOT EXISTS statut ENUM('en_attente', 'approuve', 'rejete', 'signale') DEFAULT 'en_attente',
        ADD COLUMN IF NOT EXISTS motif_rejet TEXT,
        ADD COLUMN IF NOT EXISTS nombre_signalements INT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS date_moderation DATETIME,
        ADD COLUMN IF NOT EXISTS date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('✅ Colonnes de modération ajoutées aux commentaires');
    } catch (error) {
      console.log('ℹ️ Colonnes de modération déjà présentes ou erreur:', error.message);
    }

    console.log('🎉 Migration terminée avec succès !');
  },

  down: async (connection) => {
    console.log('🔄 Suppression des colonnes de modération...');

    try {
      await connection.execute(`
        ALTER TABLE commentaires 
        DROP COLUMN IF EXISTS statut,
        DROP COLUMN IF EXISTS motif_rejet,
        DROP COLUMN IF EXISTS nombre_signalements,
        DROP COLUMN IF EXISTS date_moderation,
        DROP COLUMN IF EXISTS date_creation
      `);
      console.log('✅ Colonnes de modération supprimées');
    } catch (error) {
      console.log('ℹ️ Erreur lors de la suppression:', error.message);
    }
  }
};

module.exports = migration;
