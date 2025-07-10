require('dotenv').config();
const connection = require('./src/config/database');

async function testExemplairesSystem() {
  try {
    console.log('🚀 Test du système de gestion des exemplaires\n');

    // 1. Vérifier la structure des livres avec disponibilité
    console.log('📚 1. Vérification des livres avec calcul de disponibilité...');
    const livres = await new Promise((resolve, reject) => {
      connection.query(`
        SELECT 
          l.id,
          l.titre,
          l.auteur,
          3 as exemplaires_total,
          GREATEST(0, 3 - COALESCE(emprunts_actifs.count, 0)) as exemplaires_disponibles,
          COALESCE(emprunts_actifs.count, 0) as emprunts_actifs,
          CASE 
            WHEN GREATEST(0, 3 - COALESCE(emprunts_actifs.count, 0)) > 0 THEN 'disponible'
            ELSE 'indisponible' 
          END as statut
        FROM livres l
        LEFT JOIN (
          SELECT 
            livre_id, 
            COUNT(*) as count 
          FROM emprunts 
          WHERE date_retour_effective IS NULL 
          GROUP BY livre_id
        ) emprunts_actifs ON l.id = emprunts_actifs.livre_id
        ORDER BY l.id
        LIMIT 5
      `, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    console.log('📋 Premiers livres avec disponibilité:');
    livres.forEach(livre => {
      console.log(`   📖 "${livre.titre}" - Exemplaires: ${livre.exemplaires_disponibles}/${livre.exemplaires_total} (${livre.emprunts_actifs} empruntés) - Statut: ${livre.statut}`);
    });

    // 2. Tester les emprunts actifs
    console.log('\n📅 2. Emprunts actifs par livre...');
    const empruntsParLivre = await new Promise((resolve, reject) => {
      connection.query(`
        SELECT 
          l.titre,
          COUNT(e.id) as emprunts_actifs,
          GROUP_CONCAT(CONCAT(u.prenom, ' ', u.nom) SEPARATOR ', ') as emprunteurs
        FROM livres l
        LEFT JOIN emprunts e ON l.id = e.livre_id AND e.date_retour_effective IS NULL
        LEFT JOIN utilisateurs u ON e.utilisateur_id = u.id
        GROUP BY l.id, l.titre
        HAVING emprunts_actifs > 0
        ORDER BY emprunts_actifs DESC
      `, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (empruntsParLivre.length > 0) {
      empruntsParLivre.forEach(livre => {
        console.log(`   📚 "${livre.titre}": ${livre.emprunts_actifs} emprunt(s) actif(s)`);
        console.log(`      👥 Emprunteurs: ${livre.emprunteurs || 'Aucun'}`);
      });
    } else {
      console.log('   ✅ Aucun emprunt actif trouvé');
    }

    // 3. Simuler un emprunt
    console.log('\n🎯 3. Simulation d\'un emprunt...');
    
    // Trouver un livre disponible
    const livreDisponible = livres.find(l => l.exemplaires_disponibles > 0);
    if (livreDisponible) {
      console.log(`   📖 Livre sélectionné: "${livreDisponible.titre}" (${livreDisponible.exemplaires_disponibles} exemplaires disponibles)`);
      
      // Simuler la logique d'emprunt
      const utilisateurTest = 2; // Jean Dupont
      const dateRetourPrevue = new Date();
      dateRetourPrevue.setDate(dateRetourPrevue.getDate() + 14);

      console.log(`   👤 Utilisateur: ${utilisateurTest}`);
      console.log(`   📅 Date retour prévue: ${dateRetourPrevue.toLocaleDateString()}`);
      
      // Vérifier s'il peut emprunter (disponibilité + pas déjà emprunté)
      const peutEmprunter = await new Promise((resolve, reject) => {
        connection.query(`
          SELECT 
            (SELECT GREATEST(0, 3 - COUNT(e1.id)) FROM emprunts e1 WHERE e1.livre_id = ? AND e1.date_retour_effective IS NULL) as exemplaires_disponibles,
            (SELECT COUNT(e2.id) FROM emprunts e2 WHERE e2.livre_id = ? AND e2.utilisateur_id = ? AND e2.date_retour_effective IS NULL) as deja_emprunte
        `, [livreDisponible.id, livreDisponible.id, utilisateurTest], (err, result) => {
          if (err) reject(err);
          else resolve(result[0]);
        });
      });

      console.log(`   ✅ Exemplaires disponibles: ${peutEmprunter.exemplaires_disponibles}`);
      console.log(`   ${peutEmprunter.deja_emprunte > 0 ? '❌' : '✅'} Déjà emprunté: ${peutEmprunter.deja_emprunte > 0 ? 'Oui' : 'Non'}`);
      
      if (peutEmprunter.exemplaires_disponibles > 0 && peutEmprunter.deja_emprunte === 0) {
        console.log(`   ✅ L'emprunt peut être effectué`);
      } else {
        console.log(`   ❌ L'emprunt ne peut pas être effectué`);
      }
    } else {
      console.log('   ❌ Aucun livre disponible pour test');
    }

    // 4. Statistiques générales
    console.log('\n📊 4. Statistiques générales...');
    const stats = await new Promise((resolve, reject) => {
      connection.query(`
        SELECT 
          COUNT(DISTINCT l.id) as total_livres,
          COUNT(DISTINCT l.id) * 3 as total_exemplaires,
          SUM(GREATEST(0, 3 - COALESCE(emprunts_actifs.count, 0))) as exemplaires_disponibles,
          SUM(COALESCE(emprunts_actifs.count, 0)) as emprunts_actifs
        FROM livres l
        LEFT JOIN (
          SELECT livre_id, COUNT(*) as count 
          FROM emprunts 
          WHERE date_retour_effective IS NULL 
          GROUP BY livre_id
        ) emprunts_actifs ON l.id = emprunts_actifs.livre_id
      `, (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    });

    console.log(`   📚 Total livres: ${stats.total_livres}`);
    console.log(`   📖 Total exemplaires: ${stats.total_exemplaires}`);
    console.log(`   ✅ Exemplaires disponibles: ${stats.exemplaires_disponibles}`);
    console.log(`   📅 Emprunts actifs: ${stats.emprunts_actifs}`);
    console.log(`   📊 Taux d'utilisation: ${((stats.emprunts_actifs / stats.total_exemplaires) * 100).toFixed(1)}%`);

    console.log('\n🎉 Test terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    connection.end();
  }
}

testExemplairesSystem();
