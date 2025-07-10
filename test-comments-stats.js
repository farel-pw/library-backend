const mysql = require('mysql2/promise');

async function testCommentsStats() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'bibliotheque'
    });

    console.log('🔍 Test direct de la requête des statistiques des commentaires...');

    const query = `
      SELECT 
        COUNT(*) as total_commentaires,
        COUNT(CASE WHEN note IS NOT NULL THEN 1 END) as total_notes,
        AVG(note) as note_moyenne_generale,
        COUNT(CASE WHEN DATE(date_commentaire) = CURDATE() THEN 1 END) as commentaires_aujourd_hui,
        COUNT(CASE WHEN date_commentaire >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as commentaires_semaine,
        COUNT(CASE WHEN date_commentaire >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as commentaires_mois,
        COUNT(CASE WHEN statut = 'en_attente' THEN 1 END) as en_attente_moderation,
        COUNT(CASE WHEN statut = 'approuve' THEN 1 END) as approuves,
        COUNT(CASE WHEN statut = 'rejete' THEN 1 END) as rejetes
      FROM commentaires
    `;

    const [rows] = await connection.execute(query);
    console.log('✅ Statistiques des commentaires:', rows[0]);

    await connection.end();

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testCommentsStats();
