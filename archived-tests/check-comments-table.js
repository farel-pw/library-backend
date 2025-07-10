require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkCommentTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bibliotheque',
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('📋 Colonnes de la table commentaires:');
    const [rows] = await connection.execute('SHOW COLUMNS FROM commentaires');
    rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.Field} (${row.Type})`);
    });
    
    console.log('\n📊 Contenu de la table commentaires:');
    const [comments] = await connection.execute('SELECT * FROM commentaires LIMIT 5');
    console.table(comments);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await connection.end();
  }
}

checkCommentTable();
