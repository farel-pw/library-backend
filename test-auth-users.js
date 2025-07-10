const axios = require('axios');

const BASE_URL = 'http://localhost:4401';

async function testAuthAndUsers() {
  try {
    console.log('🔐 Test d\'authentification et gestion des utilisateurs\n');

    // 1. Test de connexion admin
    console.log('1️⃣ Test de connexion admin...');
    const loginResponse = await axios.post(`${BASE_URL}/userlogin`, {
      email: 'admin@bibliotheque.com',
      password: 'admin123'
    });

    if (loginResponse.data.error) {
      console.log('❌ Échec de la connexion:', loginResponse.data.message);
      return;
    }

    console.log('✅ Connexion réussie');
    console.log('👤 Utilisateur:', loginResponse.data.user);
    const token = loginResponse.data.token;
    console.log('🎫 Token obtenu:', token.substring(0, 50) + '...\n');

    // 2. Test de récupération des utilisateurs
    console.log('2️⃣ Test de récupération des utilisateurs...');
    const usersResponse = await axios.get(`${BASE_URL}/utilisateurs`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (usersResponse.data.error) {
      console.log('❌ Échec récupération utilisateurs:', usersResponse.data.message);
      return;
    }

    console.log('✅ Utilisateurs récupérés avec succès');
    console.log('👥 Nombre d\'utilisateurs:', usersResponse.data.data?.length || 0);
    
    if (usersResponse.data.data && usersResponse.data.data.length > 0) {
      console.log('👤 Premier utilisateur:', usersResponse.data.data[0]);
    }

    // 3. Test de récupération du profil utilisateur
    console.log('\n3️⃣ Test de récupération du profil...');
    const profileResponse = await axios.get(`${BASE_URL}/utilisateurs/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (profileResponse.data.error) {
      console.log('❌ Échec récupération profil:', profileResponse.data.message);
    } else {
      console.log('✅ Profil récupéré avec succès');
      console.log('👤 Profil:', profileResponse.data.data);
    }

    // 4. Test de création d'un livre (pour tester les permissions admin)
    console.log('\n4️⃣ Test de création d\'un livre...');
    const bookData = {
      titre: 'Test Book',
      auteur: 'Test Author',
      genre: 'Test',
      isbn: '9999999999999',
      annee_publication: 2025,
      description: 'Livre de test'
    };

    const createBookResponse = await axios.post(`${BASE_URL}/livres`, bookData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (createBookResponse.data.error) {
      console.log('❌ Échec création livre:', createBookResponse.data.message);
    } else {
      console.log('✅ Livre créé avec succès');
      console.log('📖 Réponse:', createBookResponse.data);
    }

    console.log('\n🎉 Tests terminés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    if (error.response) {
      console.error('📋 Détails de l\'erreur:', error.response.data);
      console.error('🔢 Status:', error.response.status);
    }
  }
}

testAuthAndUsers().catch(console.error);
