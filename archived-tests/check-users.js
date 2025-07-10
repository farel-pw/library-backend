require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkUsers() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'bibliotheque',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connexion à la base de données réussie');

    // Afficher les utilisateurs
    console.log('\n👥 Utilisateurs disponibles:');
    const [users] = await connection.execute('SELECT id, nom, prenom, email, role FROM utilisateurs');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.nom} ${user.prenom} (${user.email}) - Role: ${user.role}`);
    });

    console.log('\n🔧 Pour tester les commentaires, utilisez un de ces emails avec un mot de passe par défaut.');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkUsers();
