const axios = require('axios');

// Configuration identique au frontend
const API_BASE_URL = 'http://localhost:4401';

async function testFrontendScenario() {
  console.log('🧪 Test du scénario frontend complet');
  console.log('====================================\n');

  try {
    // 1. Test de l'authentification comme le frontend
    console.log('1. 🔐 Test d\'authentification...');
    
    // Tester avec les différents utilisateurs
    const testUsers = [
      { email: 'admin@bibliotheque.com', password: 'admin123' },
      { email: 'jean.dupont@example.com', password: 'password123' },
      { email: 'fankoufarida@2ie.edu', password: 'password123' }
    ];
    
    let token = null;
    let user = null;
    
    for (const testUser of testUsers) {
      try {
        const response = await axios.post(`${API_BASE_URL}/userlogin`, testUser);
        if (!response.data.error) {
          token = response.data.token;
          user = response.data.user;
          console.log(`✅ Connexion réussie avec ${testUser.email}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Échec avec ${testUser.email}: ${error.response?.data?.message || error.message}`);
      }
    }
    
    if (!token) {
      console.log('❌ Aucune authentification réussie');
      return;
    }

    // 2. Test récupération des livres
    console.log('\n2. 📚 Test récupération des livres...');
    const livresResponse = await axios.get(`${API_BASE_URL}/livres`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (livresResponse.data.error) {
      console.log('❌ Erreur récupération livres:', livresResponse.data.message);
      return;
    }
    
    // La réponse doit être dans livresResponse.data.data (tableau direct)
    const livres = livresResponse.data.data;
    console.log(`✅ ${livres.length} livres récupérés`);
    
    if (livres.length === 0) {
      console.log('❌ Aucun livre disponible pour tester');
      return;
    }
    
    const premierLivre = livres[0];
    console.log(`   Premier livre: "${premierLivre.titre}" (ID: ${premierLivre.id})`);

    // 3. Test récupération des commentaires d'un livre
    console.log('\n3. 📖 Test récupération des commentaires...');
    const commentsResponse = await axios.get(`${API_BASE_URL}/commentaires/livre/${premierLivre.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (commentsResponse.data.error) {
      console.log('❌ Erreur récupération commentaires:', commentsResponse.data.message);
    } else {
      console.log(`✅ ${commentsResponse.data.data.length} commentaires récupérés`);
    }

    // 4. Test ajout d'un commentaire (comme le frontend)
    console.log('\n4. ✍️ Test ajout d\'un commentaire...');
    
    const nouveauCommentaire = {
      livre_id: premierLivre.id,
      commentaire: `Test frontend - ${new Date().toLocaleString()}`,
      note: 4
    };
    
    console.log('   Données envoyées:', nouveauCommentaire);
    console.log('   Token utilisé:', token ? 'Présent' : 'Absent');
    
    try {
      const ajoutResponse = await axios.post(`${API_BASE_URL}/commentaires`, nouveauCommentaire, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (ajoutResponse.data.error) {
        console.log('❌ Erreur ajout commentaire:', ajoutResponse.data.message);
      } else {
        console.log('✅ Commentaire ajouté avec succès!');
        console.log('   Réponse:', ajoutResponse.data);
      }
    } catch (error) {
      console.log('❌ Erreur lors de l\'ajout:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Détails complets:', error.response?.data);
    }

    // 5. Test CORS (Cross-Origin Resource Sharing)
    console.log('\n5. 🌐 Test CORS...');
    try {
      const corsResponse = await axios.get(`${API_BASE_URL}/`, {
        headers: { 
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });
      console.log('✅ CORS semble configuré correctement');
    } catch (error) {
      console.log('⚠️ Problème potentiel avec CORS:', error.message);
    }

    // 6. Test du middleware d'authentification
    console.log('\n6. 🔒 Test du middleware d\'authentification...');
    
    // Test avec un token invalide
    try {
      await axios.post(`${API_BASE_URL}/commentaires`, nouveauCommentaire, {
        headers: { 
          Authorization: `Bearer token_invalide`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Le middleware ne rejette pas les tokens invalides');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Middleware d\'authentification fonctionne (rejette tokens invalides)');
      } else {
        console.log('⚠️ Réponse inattendue pour token invalide:', error.response?.status);
      }
    }

    // Test sans token
    try {
      await axios.post(`${API_BASE_URL}/commentaires`, nouveauCommentaire, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('❌ L\'API accepte les requêtes sans token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ L\'API rejette correctement les requêtes sans token');
      } else {
        console.log('⚠️ Réponse inattendue pour requête sans token:', error.response?.status);
      }
    }

    console.log('\n✅ Test complet terminé');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Le serveur backend n\'est pas accessible sur le port 4401');
      console.log('   Vérifiez que le serveur backend est bien démarré');
    }
  }
}

testFrontendScenario();
