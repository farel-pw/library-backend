const axios = require('axios');
const mysql = require('mysql2');
require('dotenv').config();

const BASE_URL = 'http://localhost:4401';

// Configuration base de données
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bibliotheque',
  port: parseInt(process.env.DB_PORT) || 3306
});

async function debugCommentIssue() {
  console.log('🔍 Débogage complet du problème de commentaires\n');

  try {
    // 1. Vérifier la structure de la table commentaires
    console.log('1. 📊 Vérification structure table commentaires...');
    const [tableStructure] = await connection.promise().execute('DESCRIBE commentaires');
    console.log('Structure de la table:');
    tableStructure.forEach(column => {
      console.log(`   - ${column.Field}: ${column.Type} (${column.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    // 2. Connexion utilisateur
    console.log('\n2. 🔑 Test de connexion...');
    const loginResponse = await axios.post(`${BASE_URL}/utilisateurs/login`, {
      email: 'jean.dupont@example.com',
      password: 'password123'
    });
    
    if (loginResponse.data.error) {
      console.log('❌ Erreur connexion:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log(`✅ Connexion réussie: ${user.prenom} ${user.nom} (ID: ${user.id})`);

    // 3. Préparer les données du commentaire
    console.log('\n3. 📝 Préparation des données...');
    const commentData = {
      livre_id: 1,
      commentaire: 'Test debug - ' + new Date().toISOString(),
      note: 5
    };
    console.log('Données à envoyer:', commentData);

    // 4. Vérifier que le livre existe
    console.log('\n4. 📚 Vérification du livre...');
    const [books] = await connection.promise().execute('SELECT * FROM livres WHERE id = ?', [commentData.livre_id]);
    if (books.length === 0) {
      console.log('❌ Livre non trouvé!');
      return;
    } else {
      console.log(`✅ Livre trouvé: "${books[0].titre}" par ${books[0].auteur}`);
    }

    // 5. Essayer de créer le commentaire via API
    console.log('\n5. 💬 Test création commentaire via API...');
    try {
      const response = await axios.post(`${BASE_URL}/commentaires`, commentData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Commentaire créé avec succès!');
      console.log('Réponse:', response.data);
    } catch (error) {
      console.log('❌ Erreur API:', error.response?.data || error.message);
      console.log('Status:', error.response?.status);
      
      // 6. Essayer directement en base
      console.log('\n6. 🔧 Test direct en base de données...');
      try {
        const now = new Date();
        const [result] = await connection.promise().execute(
          'INSERT INTO commentaires (utilisateur_id, livre_id, commentaire, note, date_commentaire) VALUES (?, ?, ?, ?, ?)',
          [user.id, commentData.livre_id, commentData.commentaire, commentData.note, now]
        );
        console.log('✅ Insertion directe réussie!');
        console.log('ID du commentaire:', result.insertId);
        
        // Nettoyer
        await connection.promise().execute('DELETE FROM commentaires WHERE id = ?', [result.insertId]);
        console.log('🧹 Commentaire de test supprimé');
      } catch (dbError) {
        console.log('❌ Erreur base de données:', dbError.message);
      }
    }

    // 7. Vérifier les commentaires existants
    console.log('\n7. 📋 Vérification commentaires existants...');
    const [comments] = await connection.promise().execute('SELECT COUNT(*) as count FROM commentaires');
    console.log(`Total commentaires: ${comments[0].count}`);

    console.log('\n✅ Diagnostic terminé');

  } catch (error) {
    console.error('❌ Erreur globale:', error.message);
  } finally {
    connection.end();
  }
}

debugCommentIssue();
