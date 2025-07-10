const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bibliotheque',
  port: parseInt(process.env.DB_PORT) || 3306
});

console.log('Configuration DB:', {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ? '***' : 'EMPTY',
  database: process.env.DB_NAME || 'bibliotheque',
  port: parseInt(process.env.DB_PORT) || 3306
});

connection.connect(function(err) {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données:', err.message);
    console.error('Code d\'erreur:', err.code);
    console.error('Errno:', err.errno);
    process.exit(1);
  } else {
    console.log('✅ Connexion à la base de données réussie!');
    
    // Test simple
    connection.query('SELECT 1 as test', (err, results) => {
      if (err) {
        console.error('❌ Erreur lors du test:', err.message);
      } else {
        console.log('✅ Test réussi:', results);
      }        // Test des tables et leurs données
        connection.query('SHOW TABLES', (err, results) => {
          if (err) {
            console.error('❌ Erreur lors de la récupération des tables:', err.message);
          } else {
            console.log('✅ Tables disponibles:', results.map(r => Object.values(r)[0]));
            
            // Compter les enregistrements dans chaque table
            const tables = ['utilisateurs', 'livres', 'emprunts', 'reservations', 'commentaires'];
            
            tables.forEach(table => {
              connection.query(`SELECT COUNT(*) as count FROM ${table}`, (err, results) => {
                if (err) {
                  console.error(`❌ Erreur pour ${table}:`, err.message);
                } else {
                  console.log(`📊 ${table}: ${results[0].count} enregistrements`);
                }
              });
            });
            
            // Tester les utilisateurs actifs
            connection.query('SELECT COUNT(*) as count FROM utilisateurs WHERE useractive = 1', (err, results) => {
              if (err) {
                console.error('❌ Erreur utilisateurs actifs:', err.message);
              } else {
                console.log(`👥 Utilisateurs actifs: ${results[0].count}`);
              }
            });
          }
          
          setTimeout(() => {
            connection.end();
          }, 2000);
        });
    });
  }
});
