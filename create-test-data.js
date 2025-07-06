const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bibliotheque',
  port: parseInt(process.env.DB_PORT) || 3306
});

console.log('🚀 Création des données de test...');

connection.connect(function(err) {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données:', err.message);
    process.exit(1);
  }

  // Créer des utilisateurs
  const utilisateurs = [
    { nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@test.com', mot_de_passe: '$2b$10$example', useractive: 1, role: 'etudiant' },
    { nom: 'Martin', prenom: 'Marie', email: 'marie.martin@test.com', mot_de_passe: '$2b$10$example', useractive: 1, role: 'etudiant' },
    { nom: 'Durand', prenom: 'Pierre', email: 'pierre.durand@test.com', mot_de_passe: '$2b$10$example', useractive: 1, role: 'etudiant' },
    { nom: 'Admin', prenom: 'Super', email: 'admin@test.com', mot_de_passe: '$2b$10$example', useractive: 1, role: 'admin' }
  ];

  // Créer des livres
  const livres = [
    { titre: 'Le Petit Prince', auteur: 'Antoine de Saint-Exupéry', genre: 'Fiction', isbn: '9782070408504', disponible: 1 },
    { titre: '1984', auteur: 'George Orwell', genre: 'Science-fiction', isbn: '9782070368228', disponible: 1 },
    { titre: 'Les Misérables', auteur: 'Victor Hugo', genre: 'Roman', isbn: '9782070409228', disponible: 0 },
    { titre: 'JavaScript: The Good Parts', auteur: 'Douglas Crockford', genre: 'Informatique', isbn: '9780596517748', disponible: 1 }
  ];

  console.log('📝 Insertion des utilisateurs...');
  utilisateurs.forEach((user, index) => {
    connection.query('INSERT INTO utilisateurs SET ?', user, (err, result) => {
      if (err) {
        console.error(`❌ Erreur utilisateur ${index + 1}:`, err.message);
      } else {
        console.log(`✅ Utilisateur ${user.prenom} ${user.nom} créé`);
      }
    });
  });

  console.log('📚 Insertion des livres...');
  livres.forEach((livre, index) => {
    connection.query('INSERT INTO livres SET ?', livre, (err, result) => {
      if (err) {
        console.error(`❌ Erreur livre ${index + 1}:`, err.message);
      } else {
        console.log(`✅ Livre "${livre.titre}" créé`);
      }
    });
  });

  setTimeout(() => {
    // Créer des emprunts
    console.log('📖 Création des emprunts...');
    const emprunts = [
      { utilisateur_id: 1, livre_id: 3, date_emprunt: '2025-01-01', date_retour_prevue: '2025-01-15', rendu: 0 },
      { utilisateur_id: 2, livre_id: 1, date_emprunt: '2025-01-05', date_retour_prevue: '2025-01-19', rendu: 1, date_retour_effective: '2025-01-18' }
    ];

    emprunts.forEach((emprunt, index) => {
      connection.query('INSERT INTO emprunts SET ?', emprunt, (err, result) => {
        if (err) {
          console.error(`❌ Erreur emprunt ${index + 1}:`, err.message);
        } else {
          console.log(`✅ Emprunt ${index + 1} créé`);
        }
      });
    });

    // Créer des réservations
    console.log('🎫 Création des réservations...');
    const reservations = [
      { utilisateur_id: 1, livre_id: 2, statut: 'en_attente' },
      { utilisateur_id: 3, livre_id: 1, statut: 'validée' }
    ];

    reservations.forEach((reservation, index) => {
      connection.query('INSERT INTO reservations SET ?', reservation, (err, result) => {
        if (err) {
          console.error(`❌ Erreur réservation ${index + 1}:`, err.message);
        } else {
          console.log(`✅ Réservation ${index + 1} créée`);
        }
      });
    });

    // Créer des commentaires
    console.log('💬 Création des commentaires...');
    const commentaires = [
      { utilisateur_id: 1, livre_id: 1, note: 5, commentaire: 'Excellent livre !', date_commentaire: new Date() },
      { utilisateur_id: 2, livre_id: 2, note: 4, commentaire: 'Très bon livre, je recommande.', date_commentaire: new Date() },
      { utilisateur_id: 3, livre_id: 1, note: 3, commentaire: 'Pas mal mais j\'ai lu mieux.', date_commentaire: new Date() }
    ];

    commentaires.forEach((commentaire, index) => {
      connection.query('INSERT INTO commentaires SET ?', commentaire, (err, result) => {
        if (err) {
          console.error(`❌ Erreur commentaire ${index + 1}:`, err.message);
        } else {
          console.log(`✅ Commentaire ${index + 1} créé`);
        }
      });
    });

    setTimeout(() => {
      console.log('🎉 Données de test créées avec succès !');
      connection.end();
    }, 1000);
  }, 1000);
});
