require('dotenv').config();
const mysql = require('mysql2');

console.log('Configuration de la base de données:');
console.log('Host:', process.env.DB_HOST);
console.log('User:', process.env.DB_USER);
console.log('Password:', process.env.DB_PASSWORD ? '***' : 'VIDE');
console.log('Database:', process.env.DB_NAME);
console.log('Port:', process.env.DB_PORT);

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bibliotheque',
  port: parseInt(process.env.DB_PORT) || 3306
});

connection.connect(function(err) {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données:', err.message);
    process.exit(1);
  }
  console.log('✅ Connexion à la base de données réussie');
  
  // Test simple query
  connection.query('SHOW TABLES', (err, results) => {
    if (err) {
      console.error('❌ Erreur lors de la requête:', err.message);
    } else {
      console.log('📋 Tables disponibles:', results.map(r => Object.values(r)[0]));
    }
    connection.end();
  });
});
