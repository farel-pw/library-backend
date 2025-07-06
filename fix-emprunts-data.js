require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixEmpruntsData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bibliotheque',
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('🔧 Correction des données des emprunts...\n');
    
    // Marquer comme rendus les emprunts qui ont une date_retour_effective
    await connection.execute(`
      UPDATE emprunts 
      SET rendu = 1 
      WHERE date_retour_effective IS NOT NULL
    `);
    
    console.log('✅ Emprunts avec date de retour marqués comme rendus');
    
    // Vérifier les changements
    const [emprunts] = await connection.execute(`
      SELECT id, utilisateur_id, livre_id, date_emprunt, date_retour_prevue, 
             date_retour_effective, rendu, penalites
      FROM emprunts
    `);
    
    console.log('\n📊 État des emprunts après correction:');
    console.table(emprunts);
    
    // Statistiques
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_emprunts,
        COUNT(CASE WHEN rendu = 1 THEN 1 END) as emprunts_rendus,
        COUNT(CASE WHEN rendu = 0 THEN 1 END) as emprunts_actifs,
        COUNT(CASE WHEN rendu = 0 AND date_retour_prevue < CURDATE() THEN 1 END) as emprunts_en_retard
      FROM emprunts
    `);
    
    console.log('\n📈 Statistiques après correction:');
    console.log(`   Total emprunts: ${stats[0].total_emprunts}`);
    console.log(`   Emprunts rendus: ${stats[0].emprunts_rendus}`);
    console.log(`   Emprunts actifs: ${stats[0].emprunts_actifs}`);
    console.log(`   Emprunts en retard: ${stats[0].emprunts_en_retard}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await connection.end();
  }
}

fixEmpruntsData();
