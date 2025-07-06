const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bibliotheque',
  port: parseInt(process.env.DB_PORT) || 3306
});

connection.connect(function(err) {
  if (err) {
    console.error('❌ Erreur de connexion:', err.message);
    process.exit(1);
  }
  
  console.log('✅ Connexion réussie');
  
  // Tester la requête exacte du modèle findAllWithDetails
  const query = `
    SELECT c.*, 
           u.nom, u.prenom, u.email, 
           l.titre, l.auteur, l.isbn,
           (SELECT AVG(note) FROM commentaires c2 WHERE c2.livre_id = c.livre_id AND c2.note IS NOT NULL) as note_moyenne_livre,
           (SELECT COUNT(*) FROM commentaires c3 WHERE c3.utilisateur_id = c.utilisateur_id) as commentaires_utilisateur
    FROM commentaires c
    JOIN utilisateurs u ON c.utilisateur_id = u.id
    JOIN livres l ON c.livre_id = l.id
    ORDER BY c.date_publication DESC
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('❌ Erreur requête:', err.message);
      console.error('Code erreur:', err.code);
      console.error('SQL:', err.sql);
    } else {
      console.log('✅ Requête réussie, résultats:', results.length);
      if (results.length > 0) {
        console.log('Premier commentaire:', results[0]);
      }
    }
    connection.end();
  });
});
