const mysql = require('mysql2/promise');

async function checkUsersDetails() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bibliotheque'
  });

  try {
    console.log('🔍 Vérification des utilisateurs en base...\n');
    
    // Lister tous les utilisateurs
    const [users] = await connection.execute('SELECT * FROM utilisateurs');
    console.log('📋 Utilisateurs trouvés:', users.length);
    
    users.forEach(user => {
      console.log(`
📄 ID: ${user.id}
👤 Nom: ${user.nom} ${user.prenom}
📧 Email: ${user.email}
🔑 Role: ${user.role}
✅ Actif: ${user.actif}
🗓️ Créé: ${user.date_creation}
      `);
    });

    // Essayer de créer un admin si pas d'admin
    const [admins] = await connection.execute("SELECT * FROM utilisateurs WHERE role = 'admin'");
    
    if (admins.length === 0) {
      console.log('⚠️ Aucun admin trouvé, création d\'un admin...');
      
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await connection.execute(
        `INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, actif, date_creation) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        ['Admin', 'System', 'admin@test.com', hashedPassword, 'admin', 1]
      );
      
      console.log('✅ Admin créé avec succès!');
      console.log('📧 Email: admin@test.com');
      console.log('🔑 Mot de passe: admin123');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await connection.end();
  }
}

checkUsersDetails().catch(console.error);
