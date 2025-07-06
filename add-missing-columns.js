require('dotenv').config();
const mysql = require('mysql2/promise');

async function addMissingColumns() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bibliotheque',
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('🚀 Ajout des colonnes manquantes...');
    
    // Ajouter les colonnes penalites et notes_admin
    await connection.execute(`
      ALTER TABLE emprunts 
      ADD COLUMN IF NOT EXISTS penalites DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Montant des pénalités en euros',
      ADD COLUMN IF NOT EXISTS notes_admin TEXT COMMENT 'Notes administratives sur l emprunt'
    `);
    console.log('✅ Colonnes penalites et notes_admin ajoutées');
    
    // Vérifier les nouvelles colonnes
    console.log('\n📋 Nouvelles colonnes de la table emprunts:');
    const [rows] = await connection.execute('SHOW COLUMNS FROM emprunts');
    rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.Field} (${row.Type})`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await connection.end();
  }
}

addMissingColumns();
