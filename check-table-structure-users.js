const mysql = require('mysql2/promise');

async function checkTableStructure() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bibliotheque'
  });

  try {
    console.log('🔍 Structure de la table utilisateurs:\n');
    
    const [columns] = await connection.execute('DESCRIBE utilisateurs');
    
    console.log('📋 Colonnes disponibles:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `[${col.Key}]` : ''} ${col.Default !== null ? `Default: ${col.Default}` : ''}`);
    });
    
    console.log('\n📊 Exemple de données:');
    const [sample] = await connection.execute('SELECT * FROM utilisateurs LIMIT 2');
    console.log(sample);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await connection.end();
  }
}

checkTableStructure().catch(console.error);
