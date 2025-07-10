const axios = require('axios');

const API_BASE_URL = 'http://localhost:4401';

async function testLivresAPI() {
  console.log('📚 Test de l\'API des livres');
  console.log('============================\n');

  try {
    // 1. Test de connexion pour obtenir un token
    console.log('1. 🔐 Test de connexion...');
    const loginResponse = await axios.post(`${API_BASE_URL}/userlogin`, {
      email: 'admin@bibliotheque.com',
      password: 'admin123'
    });
    
    if (loginResponse.data.error) {
      console.log('❌ Erreur connexion:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log('✅ Connexion réussie');
    console.log('   Utilisateur:', user.nom, user.prenom);

    // 2. Test récupération des livres SANS authentification
    console.log('\n2. 📖 Test récupération livres SANS token...');
    try {
      const livresResponse = await axios.get(`${API_BASE_URL}/livres`);
      
      if (livresResponse.data.error) {
        console.log('❌ Erreur sans token:', livresResponse.data.message);
      } else {
        console.log('✅ Livres récupérés sans token:', livresResponse.data.data.length);
      }
    } catch (error) {
      console.log('❌ Erreur sans token:', error.response?.data?.message || error.message);
    }

    // 3. Test récupération des livres AVEC authentification
    console.log('\n3. 📖 Test récupération livres AVEC token...');
    try {
      const livresResponse = await axios.get(`${API_BASE_URL}/livres`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (livresResponse.data.error) {
        console.log('❌ Erreur avec token:', livresResponse.data.message);
      } else {
        const livres = livresResponse.data.data;
        console.log(`✅ ${livres.length} livres récupérés avec token`);
        
        // Afficher les détails des premiers livres
        console.log('\n📋 Détails des premiers livres:');
        livres.slice(0, 3).forEach((livre, index) => {
          console.log(`   ${index + 1}. "${livre.titre}" par ${livre.auteur}`);
          console.log(`      ID: ${livre.id}, Genre: ${livre.genre}, Disponible: ${livre.disponible}`);
        });
      }
    } catch (error) {
      console.log('❌ Erreur avec token:', error.response?.data?.message || error.message);
    }

    // 4. Test avec des filtres
    console.log('\n4. 🔍 Test avec filtres...');
    try {
      const filteredResponse = await axios.get(`${API_BASE_URL}/livres?genre=Fiction`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (filteredResponse.data.error) {
        console.log('❌ Erreur filtrage:', filteredResponse.data.message);
      } else {
        console.log(`✅ ${filteredResponse.data.data.length} livres de fiction trouvés`);
      }
    } catch (error) {
      console.log('❌ Erreur filtrage:', error.response?.data?.message || error.message);
    }

    // 5. Test de pagination
    console.log('\n5. 📄 Test pagination...');
    try {
      const paginatedResponse = await axios.get(`${API_BASE_URL}/livres?page=1&limit=3`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (paginatedResponse.data.error) {
        console.log('❌ Erreur pagination:', paginatedResponse.data.message);
      } else {
        console.log(`✅ Page 1 avec limite 3: ${paginatedResponse.data.data.length} livres`);
        console.log('   Pagination:', paginatedResponse.data.pagination || 'Pas de pagination');
      }
    } catch (error) {
      console.log('❌ Erreur pagination:', error.response?.data?.message || error.message);
    }

    // 6. Test des détails d'un livre spécifique
    console.log('\n6. 🔍 Test détails d\'un livre...');
    try {
      const detailsResponse = await axios.get(`${API_BASE_URL}/livres/1`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (detailsResponse.data.error) {
        console.log('❌ Erreur détails livre:', detailsResponse.data.message);
      } else {
        console.log('✅ Détails du livre récupérés:');
        const livre = detailsResponse.data.data;
        console.log(`   Titre: ${livre.titre}`);
        console.log(`   Auteur: ${livre.auteur}`);
        console.log(`   Commentaires: ${livre.commentaires?.length || 0}`);
      }
    } catch (error) {
      console.log('❌ Erreur détails livre:', error.response?.data?.message || error.message);
    }

    // 7. Vérifier la base de données directement
    console.log('\n7. 🗄️ Vérification base de données...');
    
    // Utiliser notre script de vérification DB
    const mysql = require('mysql2/promise');
    require('dotenv').config();
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'bibliotheque',
      port: process.env.DB_PORT || 3306
    });

    const [livresDB] = await connection.execute('SELECT COUNT(*) as count FROM livres');
    console.log(`   📊 Livres dans la base: ${livresDB[0].count}`);

    const [exemples] = await connection.execute('SELECT id, titre, auteur, disponible FROM livres LIMIT 3');
    console.log('   📋 Exemples de livres en base:');
    exemples.forEach((livre, index) => {
      console.log(`      ${index + 1}. ID:${livre.id} - "${livre.titre}" par ${livre.auteur} (${livre.disponible ? 'Disponible' : 'Indisponible'})`);
    });

    await connection.end();

    console.log('\n✅ Test complet terminé');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
  }
}

testLivresAPI();
