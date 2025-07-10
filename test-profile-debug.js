const axios = require('axios');

const BASE_URL = 'http://localhost:4401';

async function testProfile() {
  try {
    console.log('👤 Test spécifique du profil personnel\n');

    // 1. Connexion admin
    console.log('1️⃣ Connexion admin...');
    const loginResponse = await axios.post(`${BASE_URL}/userlogin`, {
      email: 'admin@bibliotheque.com',
      password: 'admin123'
    });

    console.log('✅ Connexion réussie');
    console.log('👤 Données utilisateur:', loginResponse.data.user);
    
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    
    console.log('🎫 Token:', token.substring(0, 50) + '...');
    console.log('🆔 User ID:', userId);

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Test GET du profil
    console.log('\n2️⃣ Test GET /utilisateurs/profile...');
    try {
      const profileGetResponse = await axios.get(`${BASE_URL}/utilisateurs/profile`, { headers });
      console.log('✅ Profil récupéré:', profileGetResponse.data.data);
    } catch (profileGetError) {
      console.log('❌ Erreur GET profil:', profileGetError.response?.data || profileGetError.message);
    }

    // 3. Test direct GET avec l'ID
    console.log('\n3️⃣ Test GET /utilisateurs/:id direct...');
    try {
      const directGetResponse = await axios.get(`${BASE_URL}/utilisateurs/${userId}`, { headers });
      console.log('✅ Utilisateur récupéré directement:', directGetResponse.data.data);
    } catch (directGetError) {
      console.log('❌ Erreur GET direct:', directGetError.response?.data || directGetError.message);
    }

    // 4. Test PUT du profil
    console.log('\n4️⃣ Test PUT /utilisateurs/profile...');
    const profileUpdateData = {
      nom: 'Admin Test',
      prenom: 'Système Test'
    };

    try {
      const profileUpdateResponse = await axios.put(`${BASE_URL}/utilisateurs/profile`, profileUpdateData, { headers });
      console.log('✅ Profil mis à jour:', profileUpdateResponse.data);
    } catch (profileUpdateError) {
      console.log('❌ Erreur PUT profil:', profileUpdateError.response?.data || profileUpdateError.message);
    }

    // 5. Test PUT direct avec l'ID
    console.log('\n5️⃣ Test PUT /utilisateurs/:id direct...');
    try {
      const directUpdateResponse = await axios.put(`${BASE_URL}/utilisateurs/${userId}`, profileUpdateData, { headers });
      console.log('✅ Utilisateur mis à jour directement:', directUpdateResponse.data);
    } catch (directUpdateError) {
      console.log('❌ Erreur PUT direct:', directUpdateError.response?.data || directUpdateError.message);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.response?.data || error.message);
  }
}

testProfile().catch(console.error);
