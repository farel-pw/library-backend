const axios = require('axios');

async function debugRouteTest() {
  try {
    console.log('🕵️ Debug spécifique de la route PUT /utilisateurs/profile\n');

    // 1. Connexion
    const loginResponse = await axios.post('http://localhost:4401/userlogin', {
      email: 'admin@bibliotheque.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;

    // 2. Créer un endpoint de test temporaire
    console.log('2️⃣ Test avec différentes données...');

    const testCases = [
      { nom: 'Test 1' },
      { prenom: 'Test 2' },
      { nom: 'Test 3', prenom: 'Test 3' },
      { nom: 'Test 4', prenom: 'Test 4', email: 'admin@bibliotheque.com' } // Ne devrait pas changer l'email
    ];

    for (const [index, testData] of testCases.entries()) {
      console.log(`\n${index + 1}. Test avec:`, testData);
      
      try {
        const response = await axios.put('http://localhost:4401/utilisateurs/profile', testData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('   ✅ Succès:', response.data);
      } catch (error) {
        console.log('   ❌ Échec:', error.response?.data || error.message);
        
        // Si ça échoue, testons la route directe
        console.log('   🔄 Test route directe...');
        try {
          const directResponse = await axios.put('http://localhost:4401/utilisateurs/1', testData, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          console.log('   ✅ Route directe succès:', directResponse.data);
        } catch (directError) {
          console.log('   ❌ Route directe échec:', directError.response?.data || directError.message);
        }
      }
    }

    // 3. Vérifier l'état final
    console.log('\n3️⃣ État final de l\'utilisateur...');
    const finalResponse = await axios.get('http://localhost:4401/utilisateurs/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('État final:', finalResponse.data.data);

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

debugRouteTest().catch(console.error);
