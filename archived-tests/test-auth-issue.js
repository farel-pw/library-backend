const axios = require('axios');

async function testAuthenticationIssue() {
  console.log('🔍 Diagnostic du problème d\'authentification (401)\n');

  try {
    // 1. Test de connexion normale
    console.log('1. 🔐 Test de connexion...');
    const loginResponse = await axios.post('http://localhost:4401/userlogin', {
      email: 'jean.dupont@example.com',
      password: 'password123'
    });
    
    if (loginResponse.data.error) {
      console.log('❌ Erreur de connexion:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log(`✅ Connexion réussie: ${user.prenom} ${user.nom}`);
    console.log(`Token: ${token.substring(0, 20)}...`);

    // 2. Test avec token valide
    console.log('\n2. ✅ Test avec token valide...');
    try {
      const validResponse = await axios.post('http://localhost:4401/commentaires/bibliotheque', {
        commentaire: 'Test avec token valide',
        note: 5
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Résultat:', validResponse.data);
    } catch (error) {
      console.log('❌ Erreur avec token valide:', error.response?.data || error.message);
    }

    // 3. Test avec token invalide
    console.log('\n3. ❌ Test avec token invalide...');
    try {
      const invalidResponse = await axios.post('http://localhost:4401/commentaires/bibliotheque', {
        commentaire: 'Test avec token invalide',
        note: 5
      }, {
        headers: { 
          'Authorization': 'Bearer token_invalide_12345',
          'Content-Type': 'application/json'
        }
      });
      console.log('Résultat inattendu:', invalidResponse.data);
    } catch (error) {
      console.log('✅ Erreur attendue (401):', error.response?.status, error.response?.data?.message);
    }

    // 4. Test sans token
    console.log('\n4. 🚫 Test sans token...');
    try {
      const noTokenResponse = await axios.post('http://localhost:4401/commentaires/bibliotheque', {
        commentaire: 'Test sans token',
        note: 5
      }, {
        headers: { 
          'Content-Type': 'application/json'
        }
      });
      console.log('Résultat inattendu:', noTokenResponse.data);
    } catch (error) {
      console.log('✅ Erreur attendue (401):', error.response?.status, error.response?.data?.message);
    }

    console.log('\n📋 SOLUTIONS POUR L\'ERREUR 401:');
    console.log('1. 🔄 Déconnectez-vous et reconnectez-vous dans le frontend');
    console.log('2. 🧹 Videz le localStorage du navigateur:');
    console.log('   - Ouvrez F12 → Console');
    console.log('   - Tapez: localStorage.clear()');
    console.log('   - Appuyez sur Entrée');
    console.log('3. 🔐 Vérifiez que vous êtes bien connecté');
    console.log('4. ⏰ Le token a peut-être expiré (24h de validité)');

  } catch (error) {
    console.error('❌ Erreur globale:', error.message);
  }
}

testAuthenticationIssue();
