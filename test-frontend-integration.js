const axios = require('axios');

const BASE_URL = 'http://localhost:4401';

async function testFrontendIntegration() {
  try {
    console.log('🔗 Test d\'intégration Frontend-Backend\n');

    // 1. Test connexion et récupération du token
    console.log('1️⃣ Test de connexion pour obtenir un token...');
    const loginResponse = await axios.post(`${BASE_URL}/userlogin`, {
      email: 'admin@bibliotheque.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Token obtenu:', token.substring(0, 50) + '...\n');

    // 2. Test des endpoints utilisés par le frontend
    const endpoints = [
      { name: 'Livres', url: '/livres', method: 'GET' },
      { name: 'Utilisateurs', url: '/utilisateurs', method: 'GET', requiresAuth: true },
      { name: 'Analytics Dashboard', url: '/analytics/dashboard', method: 'GET', requiresAuth: true },
      { name: 'Emprunts Details', url: '/emprunts/details', method: 'GET', requiresAuth: true },
      { name: 'Commentaires', url: '/commentaires', method: 'GET' },
      { name: 'Réservations', url: '/reservations', method: 'GET', requiresAuth: true }
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Test ${endpoint.name} (${endpoint.method} ${endpoint.url})...`);
        
        const config = {
          method: endpoint.method.toLowerCase(),
          url: `${BASE_URL}${endpoint.url}`,
          headers: {}
        };

        if (endpoint.requiresAuth) {
          config.headers['Authorization'] = `Bearer ${token}`;
          config.headers['Content-Type'] = 'application/json';
        }

        const response = await axios(config);
        
        if (response.data.error) {
          console.log(`❌ ${endpoint.name}: ${response.data.message}`);
        } else {
          const dataLength = response.data.data ? response.data.data.length : 'N/A';
          console.log(`✅ ${endpoint.name}: Succès (${dataLength} éléments)`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint.name}: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
    }

    // 3. Test de création/modification d'un livre
    console.log('\n3️⃣ Test CRUD sur les livres...');
    
    const newBook = {
      titre: 'Test Frontend Book',
      auteur: 'Test Author Frontend',
      genre: 'Test',
      isbn: '1111111111111',
      annee_publication: 2025,
      description: 'Livre de test pour le frontend',
      exemplaires_total: 3
    };

    try {
      // Création
      const createResponse = await axios.post(`${BASE_URL}/livres`, newBook, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Création livre:', createResponse.data.message);
      const bookId = createResponse.data.id;

      // Modification
      const updateData = { ...newBook, titre: 'Test Frontend Book - Modifié' };
      const updateResponse = await axios.put(`${BASE_URL}/livres/${bookId}`, updateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Modification livre:', updateResponse.data.message);

      // Suppression
      const deleteResponse = await axios.delete(`${BASE_URL}/livres/${bookId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Suppression livre:', deleteResponse.data.message);

    } catch (error) {
      console.log('❌ Erreur CRUD livre:', error.response?.data?.message || error.message);
    }

    // 4. Test des en-têtes CORS
    console.log('\n4️⃣ Test des en-têtes CORS...');
    try {
      const corsResponse = await axios.options(`${BASE_URL}/livres`);
      console.log('✅ CORS Headers présents:', Object.keys(corsResponse.headers).filter(h => h.includes('access-control')));
    } catch (error) {
      console.log('⚠️ Pas de réponse OPTIONS CORS (normal si pas configuré)');
    }

    console.log('\n🎉 Tests d\'intégration terminés !');

  } catch (error) {
    console.error('❌ Erreur lors des tests d\'intégration:', error.message);
    if (error.response) {
      console.error('📋 Détails:', error.response.data);
    }
  }
}

testFrontendIntegration().catch(console.error);
