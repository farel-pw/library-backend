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
  
  // Vérifier la structure de la table commentaires
  connection.query('DESCRIBE commentaires', (err, results) => {
    if (err) {
      console.error('❌ Erreur structure:', err.message);
    } else {
      console.log('📋 Structure de la table commentaires:');
      console.table(results);
      
      // Tester une requête simple
      connection.query('SELECT * FROM commentaires LIMIT 2', (err, results) => {
        if (err) {
          console.error('❌ Erreur requête:', err.message);
        } else {
          console.log('📝 Données commentaires:');
          console.log(results);
        }
        connection.end();
      });
    }
  });
});
