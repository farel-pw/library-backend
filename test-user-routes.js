const axios = require('axios');

const BASE_URL = 'http://localhost:4401';

async function testUserRoutes() {
  try {
    console.log('👥 Test des routes utilisateurs corrigées\n');

    // 1. Connexion admin
    console.log('1️⃣ Connexion admin...');
    const loginResponse = await axios.post(`${BASE_URL}/userlogin`, {
      email: 'admin@bibliotheque.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie\n');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Test récupération des utilisateurs
    console.log('2️⃣ Test GET /utilisateurs...');
    const usersResponse = await axios.get(`${BASE_URL}/utilisateurs`, { headers });
    console.log('✅ Récupération des utilisateurs:', usersResponse.data.data?.length || 0, 'utilisateurs');

    // 3. Test récupération d'un utilisateur par ID
    console.log('\n3️⃣ Test GET /utilisateurs/:id...');
    const userResponse = await axios.get(`${BASE_URL}/utilisateurs/2`, { headers });
    console.log('✅ Utilisateur récupéré:', userResponse.data.data?.nom);

    // 4. Test création d'un utilisateur
    console.log('\n4️⃣ Test POST /utilisateurs (création)...');
    const newUserData = {
      nom: 'Test',
      prenom: 'Utilisateur',
      email: `test${Date.now()}@example.com`,
      password: 'test123',
      role: 'etudiant'
    };

    try {
      const createResponse = await axios.post(`${BASE_URL}/utilisateurs`, newUserData, { headers });
      console.log('✅ Utilisateur créé:', createResponse.data);
      
      const newUserId = createResponse.data.id;

      // 5. Test mise à jour de l'utilisateur créé
      console.log('\n5️⃣ Test PUT /utilisateurs/:id (mise à jour)...');
      const updateData = {
        nom: 'Test Modifié',
        prenom: 'Utilisateur Modifié'
      };

      const updateResponse = await axios.put(`${BASE_URL}/utilisateurs/${newUserId}`, updateData, { headers });
      console.log('✅ Utilisateur mis à jour:', updateResponse.data);

      // 6. Test changement de statut
      console.log('\n6️⃣ Test PATCH /utilisateurs/:id/status...');
      const statusResponse = await axios.patch(`${BASE_URL}/utilisateurs/${newUserId}/status`, { active: false }, { headers });
      console.log('✅ Statut modifié:', statusResponse.data);

      // 7. Test suppression de l'utilisateur
      console.log('\n7️⃣ Test DELETE /utilisateurs/:id...');
      const deleteResponse = await axios.delete(`${BASE_URL}/utilisateurs/${newUserId}`, { headers });
      console.log('✅ Utilisateur supprimé:', deleteResponse.data);

    } catch (createError) {
      console.log('❌ Erreur création utilisateur:', createError.response?.data || createError.message);
    }

    // 8. Test mise à jour du profil personnel
    console.log('\n8️⃣ Test PUT /utilisateurs/profile (profil personnel)...');
    const profileUpdateData = {
      nom: 'Admin Modifié',
      prenom: 'Système Modifié'
    };

    try {
      const profileResponse = await axios.put(`${BASE_URL}/utilisateurs/profile`, profileUpdateData, { headers });
      console.log('✅ Profil personnel mis à jour:', profileResponse.data);
    } catch (profileError) {
      console.log('❌ Erreur mise à jour profil:', profileError.response?.data || profileError.message);
    }

    console.log('\n🎉 Tous les tests terminés !');

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

testUserRoutes().catch(console.error);
