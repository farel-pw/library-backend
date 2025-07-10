const mysql = require('mysql2');
require('dotenv').config();

// Configuration de la base de données
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '2ieapi'
});

async function testEmpruntsCalculs() {
  console.log('🔍 Test des calculs d\'emprunts...\n');

  try {
    // 1. Vérifier la structure de la table emprunts
    console.log('1. Structure de la table emprunts:');
    const [structure] = await connection.promise().query('DESCRIBE emprunts');
    console.table(structure);

    // 2. Compter tous les emprunts
    console.log('\n2. Statistiques générales des emprunts:');
    const [total] = await connection.promise().query('SELECT COUNT(*) as total FROM emprunts');
    console.log(`Total emprunts: ${total[0].total}`);

    // 3. Emprunts par statut avec dates explicites
    console.log('\n3. Emprunts par statut:');
    const [statuts] = await connection.promise().query(`
      SELECT 
        COUNT(*) as total_emprunts,
        COUNT(CASE WHEN date_retour_effective IS NULL THEN 1 END) as emprunts_en_cours,
        COUNT(CASE WHEN date_retour_effective IS NOT NULL THEN 1 END) as emprunts_rendus,
        COUNT(CASE WHEN date_retour_effective IS NULL AND date_retour_prevue < CURDATE() THEN 1 END) as emprunts_en_retard,
        COUNT(CASE WHEN date_retour_effective IS NULL AND date_retour_prevue >= CURDATE() THEN 1 END) as emprunts_dans_les_temps
      FROM emprunts
    `);
    console.table(statuts);

    // 4. Détails des emprunts en cours
    console.log('\n4. Détails des emprunts en cours:');
    const [enCours] = await connection.promise().query(`
      SELECT 
        e.id,
        e.date_emprunt,
        e.date_retour_prevue,
        e.date_retour_effective,
        DATEDIFF(CURDATE(), e.date_retour_prevue) as jours_retard,
        CASE 
          WHEN e.date_retour_effective IS NOT NULL THEN 'rendu'
          WHEN e.date_retour_prevue < CURDATE() THEN 'en_retard'
          ELSE 'en_cours'
        END as statut_calcule,
        u.nom,
        u.prenom,
        l.titre
      FROM emprunts e
      JOIN utilisateurs u ON e.utilisateur_id = u.id
      JOIN livres l ON e.livre_id = l.id
      WHERE e.date_retour_effective IS NULL
      ORDER BY e.date_retour_prevue ASC
      LIMIT 10
    `);
    console.table(enCours);

    // 5. Test de la requête analytics dashboard
    console.log('\n5. Test de la requête dashboard analytics:');
    const [dashboard] = await connection.promise().query(`
      SELECT 
        (SELECT COUNT(*) FROM livres) as total_livres,
        (SELECT COUNT(*) FROM livres WHERE disponible = 1) as livres_disponibles,
        (SELECT COUNT(*) FROM utilisateurs WHERE role = 'etudiant') as total_utilisateurs,
        (SELECT COUNT(*) FROM utilisateurs WHERE role = 'etudiant' AND useractive = 1) as utilisateurs_actifs,
        (SELECT COUNT(*) FROM utilisateurs WHERE role = 'etudiant' AND date_creation >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as nouveaux_utilisateurs,
        (SELECT COUNT(*) FROM emprunts) as total_emprunts,
        (SELECT COUNT(*) FROM emprunts WHERE date_retour_effective IS NULL) as emprunts_actifs,
        (SELECT COUNT(*) FROM emprunts WHERE date_retour_effective IS NULL AND date_retour_prevue < CURDATE()) as emprunts_en_retard,
        (SELECT COUNT(*) FROM emprunts WHERE date_emprunt >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as emprunts_semaine,
        (SELECT COUNT(*) FROM reservations) as total_reservations,
        (SELECT COUNT(*) FROM reservations WHERE statut = 'en_attente') as reservations_en_attente,
        (SELECT COUNT(*) FROM reservations WHERE statut = 'prete') as reservations_pretes,
        (SELECT COUNT(*) FROM commentaires) as total_commentaires,
        (SELECT COUNT(*) FROM commentaires WHERE date_publication >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as commentaires_semaine,
        (SELECT ROUND(AVG(note), 2) FROM commentaires WHERE note IS NOT NULL) as note_moyenne_generale
    `);
    console.table(dashboard);

    // 6. Vérifier les emprunts avec détails pour admin
    console.log('\n6. Emprunts avec détails (format admin):');
    const [adminEmprunts] = await connection.promise().query(`
      SELECT 
        e.id,
        e.utilisateur_id,
        e.livre_id,
        e.date_emprunt,
        e.date_retour_prevue,
        e.date_retour_effective,
        e.penalites,
        e.notes_admin,
        u.nom,
        u.prenom,
        u.email,
        l.titre,
        l.auteur,
        l.isbn,
        CASE 
          WHEN e.date_retour_effective IS NOT NULL THEN 'rendu'
          WHEN e.date_retour_prevue < CURDATE() THEN 'en_retard'
          ELSE 'en_cours'
        END as statut_calcule
      FROM emprunts e
      JOIN utilisateurs u ON e.utilisateur_id = u.id
      JOIN livres l ON e.livre_id = l.id
      ORDER BY e.date_emprunt DESC
      LIMIT 5
    `);
    console.table(adminEmprunts);

    console.log('\n✅ Test terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    connection.end();
  }
}

// Exécuter le test
testEmpruntsCalculs().catch(console.error);
