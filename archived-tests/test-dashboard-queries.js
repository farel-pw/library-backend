require('dotenv').config();
const mysql = require('mysql2/promise');

async function testDashboardQueries() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bibliotheque',
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('🔍 Test des requêtes du dashboard...\n');
    
    // Test 1: Comptage des livres
    console.log('1. 📚 Livres:');
    const [livres] = await connection.execute('SELECT COUNT(*) as total FROM livres');
    console.log(`   Total livres: ${livres[0].total}`);
    
    const [livresDisponibles] = await connection.execute('SELECT COUNT(*) as total FROM livres WHERE disponible = 1');
    console.log(`   Livres disponibles: ${livresDisponibles[0].total}`);
    
    // Test 2: Comptage des utilisateurs
    console.log('\n2. 👥 Utilisateurs:');
    const [utilisateurs] = await connection.execute('SELECT COUNT(*) as total FROM utilisateurs WHERE role = "etudiant"');
    console.log(`   Total utilisateurs étudiants: ${utilisateurs[0].total}`);
    
    const [utilisateursActifs] = await connection.execute('SELECT COUNT(*) as total FROM utilisateurs WHERE role = "etudiant" AND useractive = 1');
    console.log(`   Utilisateurs actifs: ${utilisateursActifs[0].total}`);
    
    // Test 3: Comptage des emprunts
    console.log('\n3. 📖 Emprunts:');
    const [emprunts] = await connection.execute('SELECT COUNT(*) as total FROM emprunts');
    console.log(`   Total emprunts: ${emprunts[0].total}`);
    
    const [empruntsActifs] = await connection.execute('SELECT COUNT(*) as total FROM emprunts WHERE rendu = 0');
    console.log(`   Emprunts actifs (rendu=0): ${empruntsActifs[0].total}`);
    
    const [empruntsEnRetard] = await connection.execute('SELECT COUNT(*) as total FROM emprunts WHERE rendu = 0 AND date_retour_prevue < CURDATE()');
    console.log(`   Emprunts en retard: ${empruntsEnRetard[0].total}`);
    
    // Test 4: Voir le contenu des emprunts
    console.log('\n4. 🔍 Détails des emprunts:');
    const [detailsEmprunts] = await connection.execute('SELECT id, utilisateur_id, livre_id, date_emprunt, date_retour_prevue, date_retour_effective, rendu FROM emprunts');
    console.table(detailsEmprunts);
    
    // Test 5: Réservations
    console.log('\n5. 📋 Réservations:');
    const [reservations] = await connection.execute('SELECT COUNT(*) as total FROM reservations');
    console.log(`   Total réservations: ${reservations[0].total}`);
    
    const [reservationsEnAttente] = await connection.execute('SELECT COUNT(*) as total FROM reservations WHERE statut = "en_attente"');
    console.log(`   Réservations en attente: ${reservationsEnAttente[0].total}`);
    
    // Test 6: Commentaires
    console.log('\n6. 💬 Commentaires:');
    const [commentaires] = await connection.execute('SELECT COUNT(*) as total FROM commentaires');
    console.log(`   Total commentaires: ${commentaires[0].total}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await connection.end();
  }
}

testDashboardQueries();
