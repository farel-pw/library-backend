const mysql = require('mysql2/promise');

async function checkTableStructure() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bibliotheque'
  });

  try {
    console.log('🔍 Vérification de la structure de la table livres...\n');
    
    // Obtenir la structure de la table
    const [columns] = await connection.execute('DESCRIBE livres');
    
    console.log('📋 Colonnes de la table livres:');
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `[${col.Key}]` : ''} ${col.Default !== null ? `Default: ${col.Default}` : ''}`);
    });

    console.log('\n📚 Quelques exemples de livres:');
    const [books] = await connection.execute('SELECT * FROM livres LIMIT 3');
    console.log(JSON.stringify(books, null, 2));

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await connection.end();
  }
}

checkTableStructure().catch(console.error);
