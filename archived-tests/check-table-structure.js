require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkTableStructure() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bibliotheque',
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('📋 Structure de la table emprunts:');
    const [rows] = await connection.execute('DESCRIBE emprunts');
    console.table(rows);
    
    console.log('\n📋 Structure de la table utilisateurs:');
    const [userRows] = await connection.execute('DESCRIBE utilisateurs');
    console.table(userRows);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await connection.end();
  }
}

checkTableStructure();
