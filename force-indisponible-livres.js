const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// Configuration de la base de données
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bibliotheque'
};

async function forceIndisponibilityOfBooks() {
  let connection;
  
  try {
    console.log('🔌 Connexion à la base de données...');
    connection = await mysql.createConnection(dbConfig);
    
    // Récupérer les 3 premiers livres
    const [books] = await connection.execute(
      'SELECT id, titre FROM livres ORDER BY id ASC LIMIT 3'
    );
    
    if (books.length < 3) {
      console.log('❌ Pas assez de livres dans la base de données');
      return;
    }
    
    console.log('📚 Livres sélectionnés pour être rendus indisponibles:');
    books.forEach((book, index) => {
      console.log(`${index + 1}. ${book.titre} (ID: ${book.id})`);
    });
    
    // Créer des utilisateurs fictifs si nécessaire
    console.log('\n👥 Création d\'utilisateurs fictifs...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const fictifsUsers = [
      { nom: 'Martin', prenom: 'Jean', email: 'jean.martin@test.com' },
      { nom: 'Dupont', prenom: 'Marie', email: 'marie.dupont@test.com' },
      { nom: 'Bernard', prenom: 'Pierre', email: 'pierre.bernard@test.com' }
    ];
    
    const userIds = [];
    
    for (const user of fictifsUsers) {
      try {
        const [result] = await connection.execute(
          'INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role) VALUES (?, ?, ?, ?, ?)',
          [user.nom, user.prenom, user.email, hashedPassword, 'utilisateur']
        );
        userIds.push(result.insertId);
        console.log(`✅ Utilisateur créé: ${user.prenom} ${user.nom} (ID: ${result.insertId})`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          // L'utilisateur existe déjà, récupérer son ID
          const [existingUser] = await connection.execute(
            'SELECT id FROM utilisateurs WHERE email = ?',
            [user.email]
          );
          if (existingUser.length > 0) {
            userIds.push(existingUser[0].id);
            console.log(`ℹ️ Utilisateur existant: ${user.prenom} ${user.nom} (ID: ${existingUser[0].id})`);
          }
        } else {
          throw error;
        }
      }
    }
    
    // Pour chaque livre, créer 3 emprunts (tous les exemplaires)
    console.log('\n📖 Création des emprunts pour rendre les livres indisponibles...');
    
    for (let i = 0; i < books.length; i++) {
      const book = books[i];
      console.log(`\n📚 Traitement du livre: ${book.titre}`);
      
      // Supprimer les anciens emprunts de ce livre
      await connection.execute(
        'DELETE FROM emprunts WHERE livre_id = ?',
        [book.id]
      );
      
      // Créer 3 emprunts (tous les exemplaires)
      for (let exemplaire = 1; exemplaire <= 3; exemplaire++) {
        const userId = userIds[exemplaire - 1];
        const dateEmprunt = new Date();
        const dateRetourPrevu = new Date();
        dateRetourPrevu.setDate(dateRetourPrevu.getDate() + 14); // 14 jours
        
        const [result] = await connection.execute(
          'INSERT INTO emprunts (utilisateur_id, livre_id, date_emprunt, date_retour_prevue, statut) VALUES (?, ?, ?, ?, ?)',
          [userId, book.id, dateEmprunt, dateRetourPrevu, 'en_cours']
        );
        
        console.log(`  ✅ Exemplaire ${exemplaire} emprunté par utilisateur ${userId} (Emprunt ID: ${result.insertId})`);
      }
    }
    
    // Vérifier la disponibilité des livres
    console.log('\n🔍 Vérification de la disponibilité des livres...');
    
    for (const book of books) {
      const [emprunts] = await connection.execute(
        'SELECT COUNT(*) as total FROM emprunts WHERE livre_id = ? AND statut = "en_cours"',
        [book.id]
      );
      
      const exemplairesEmpruntes = emprunts[0].total;
      const disponible = 3 - exemplairesEmpruntes;
      
      console.log(`📚 ${book.titre}:`);
      console.log(`   - Exemplaires empruntés: ${exemplairesEmpruntes}/3`);
      console.log(`   - Disponible: ${disponible}`);
      console.log(`   - Statut: ${disponible > 0 ? '✅ DISPONIBLE' : '❌ INDISPONIBLE (bouton Réserver)'}`);
    }
    
    console.log('\n🎉 Opération terminée avec succès!');
    console.log('📱 Vous pouvez maintenant aller sur le frontend pour voir:');
    console.log('   - Les 3 premiers livres avec le bouton "Réserver"');
    console.log('   - Tester la création de réservations');
    console.log('   - Vérifier les notifications de réservation');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter le script
forceIndisponibilityOfBooks();
