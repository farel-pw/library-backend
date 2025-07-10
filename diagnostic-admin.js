/**
 * Script de diagnostic des fonctions admin qui ne marchent pas
 */

const mysql = require('mysql2/promise');

async function diagnosticAdmin() {
  console.log('🔍 DIAGNOSTIC DES FONCTIONS ADMIN');
  console.log('==================================\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'bibliotheque'
    });

    // 1. Test de la requête des statistiques des commentaires
    console.log('1️⃣ Test des statistiques des commentaires...');
    try {
      const [statsResult] = await connection.execute(`
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
      `);
      
      console.log('✅ Statistiques des commentaires réussies :');
      console.log(JSON.stringify(statsResult[0], null, 2));
      
    } catch (error) {
      console.log('❌ Erreur statistiques commentaires:', error.message);
    }

    // 2. Test de la requête des commentaires en modération
    console.log('\n2️⃣ Test des commentaires en modération...');
    try {
      const [moderationResult] = await connection.execute(`
        SELECT c.*, u.nom as utilisateur_nom, u.prenom as utilisateur_prenom, l.titre, l.auteur
        FROM commentaires c
        JOIN utilisateurs u ON c.utilisateur_id = u.id
        JOIN livres l ON c.livre_id = l.id
        WHERE c.statut = 'en_attente'
        ORDER BY c.date_commentaire DESC
      `);
      
      console.log(`✅ Commentaires en modération (${moderationResult.length} trouvés) :`);
      moderationResult.slice(0, 3).forEach((comment, index) => {
        console.log(`   ${index + 1}. "${comment.commentaire}" par ${comment.utilisateur_nom} pour "${comment.titre}"`);
      });
      
    } catch (error) {
      console.log('❌ Erreur commentaires modération:', error.message);
    }

    // 3. Vérification de la structure de la table commentaires
    console.log('\n3️⃣ Vérification structure table commentaires...');
    try {
      const [columns] = await connection.execute("DESCRIBE commentaires");
      console.log('✅ Colonnes de la table commentaires :');
      columns.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      
    } catch (error) {
      console.log('❌ Erreur structure table:', error.message);
    }

    // 4. Vérification des données de test dans commentaires
    console.log('\n4️⃣ Exemples de commentaires...');
    try {
      const [examples] = await connection.execute(`
        SELECT id, utilisateur_id, livre_id, commentaire, note, date_commentaire, statut 
        FROM commentaires 
        LIMIT 3
      `);
      
      console.log('✅ Exemples de commentaires :');
      examples.forEach((comment, index) => {
        console.log(`   ${index + 1}. ID: ${comment.id}, Note: ${comment.note}, Statut: ${comment.statut}`);
        console.log(`      Date: ${comment.date_commentaire}`);
      });
      
    } catch (error) {
      console.log('❌ Erreur exemples commentaires:', error.message);
    }

    // 5. Test dashboard analytics
    console.log('\n5️⃣ Test dashboard analytics...');
    try {
      const [dashResult] = await connection.execute(`
        SELECT 
          (SELECT COUNT(*) FROM livres) as total_livres,
          (SELECT COUNT(*) FROM livres WHERE disponible = 1) as livres_disponibles,
          (SELECT COUNT(*) FROM utilisateurs WHERE role != 'admin') as total_utilisateurs,
          (SELECT COUNT(*) FROM emprunts) as total_emprunts,
          (SELECT COUNT(*) FROM emprunts WHERE date_retour_effective IS NULL) as emprunts_actifs,
          (SELECT COUNT(*) FROM reservations) as total_reservations,
          (SELECT COUNT(*) FROM commentaires) as total_commentaires,
          (SELECT COUNT(*) FROM notifications) as total_notifications
      `);
      
      console.log('✅ Dashboard analytics réussies :');
      console.log(JSON.stringify(dashResult[0], null, 2));
      
    } catch (error) {
      console.log('❌ Erreur dashboard analytics:', error.message);
    }

    await connection.end();
    console.log('\n✅ Diagnostic terminé !');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

diagnosticAdmin();
