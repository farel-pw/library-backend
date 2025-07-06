const mysql = require('mysql2/promise');

const migration = {
  up: async (connection) => {
    console.log('🚀 Standardisation des colonnes de commentaires...');

    // Vérifier si les colonnes existent et les standardiser
    try {
      // Ajout de la colonne date_commentaire si elle n'existe pas
      await connection.execute(`
        ALTER TABLE commentaires 
        ADD COLUMN IF NOT EXISTS date_commentaire DATETIME DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('✅ Colonne date_commentaire ajoutée');

      // Copier les données de date_publication vers date_commentaire si nécessaire
      await connection.execute(`
        UPDATE commentaires 
        SET date_commentaire = COALESCE(date_publication, date_creation, CURRENT_TIMESTAMP)
        WHERE date_commentaire IS NULL
      `);
      console.log('✅ Données de date migrées');

      // Supprimer l'ancienne colonne date_publication si elle existe
      await connection.execute(`
        ALTER TABLE commentaires 
        DROP COLUMN IF EXISTS date_publication
      `);
      console.log('✅ Ancienne colonne date_publication supprimée');

    } catch (error) {
      console.log('ℹ️ Erreur lors de la standardisation:', error.message);
    }

    console.log('🎉 Migration de standardisation terminée !');
  },

  down: async (connection) => {
    console.log('🔄 Retour vers date_publication...');

    try {
      await connection.execute(`
        ALTER TABLE commentaires 
        ADD COLUMN IF NOT EXISTS date_publication DATETIME DEFAULT CURRENT_TIMESTAMP
      `);
      
      await connection.execute(`
        UPDATE commentaires 
        SET date_publication = date_commentaire
        WHERE date_publication IS NULL
      `);
      
      await connection.execute(`
        ALTER TABLE commentaires 
        DROP COLUMN IF EXISTS date_commentaire
      `);
      console.log('✅ Retour vers date_publication terminé');
    } catch (error) {
      console.log('ℹ️ Erreur lors du retour:', error.message);
    }
  }
};

module.exports = migration;
