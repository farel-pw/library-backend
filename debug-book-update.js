const axios = require('axios');

const BASE_URL = 'http://localhost:4401';

async function debugBookUpdate() {
  try {
    console.log('🔧 Debug de la mise à jour des livres\n');

    // 1. Connexion
    const loginResponse = await axios.post(`${BASE_URL}/userlogin`, {
      email: 'admin@bibliotheque.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;

    // 2. Créer un livre de test
    console.log('📖 Création d\'un livre de test...');
    const newBook = {
      titre: 'Debug Test Book',
      auteur: 'Debug Author',
      genre: 'Test',
      isbn: `${Date.now()}`, // ISBN unique basé sur timestamp
      annee_publication: 2025,
      description: 'Livre pour debug'
    };

    const createResponse = await axios.post(`${BASE_URL}/livres`, newBook, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Livre créé:', createResponse.data);
    const bookId = createResponse.data.id;

    // 3. Récupérer le livre pour voir sa structure
    console.log('\n📖 Récupération du livre créé...');
    const getResponse = await axios.get(`${BASE_URL}/livres/${bookId}`);
    console.log('📋 Structure du livre:', JSON.stringify(getResponse.data, null, 2));

    // 4. Essayer de mettre à jour avec différentes structures
    console.log('\n🔄 Test de mise à jour - Version 1 (simple)...');
    const updateData1 = {
      titre: 'Debug Test Book - Modifié v1'
    };

    try {
      const updateResponse1 = await axios.put(`${BASE_URL}/livres/${bookId}`, updateData1, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Mise à jour v1 réussie:', updateResponse1.data);
    } catch (error) {
      console.log('❌ Erreur mise à jour v1:', error.response?.data || error.message);
    }

    // 5. Test avec tous les champs
    console.log('\n🔄 Test de mise à jour - Version 2 (complète)...');
    const updateData2 = {
      titre: 'Debug Test Book - Modifié v2',
      auteur: 'Debug Author Modified',
      genre: 'Test Modified',
      isbn: '9999999999999',
      annee_publication: 2024,
      description: 'Livre pour debug modifié',
      exemplaires_total: 3
    };

    try {
      const updateResponse2 = await axios.put(`${BASE_URL}/livres/${bookId}`, updateData2, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Mise à jour v2 réussie:', updateResponse2.data);
    } catch (error) {
      console.log('❌ Erreur mise à jour v2:', error.response?.data || error.message);
    }

    // 6. Nettoyer en supprimant le livre
    console.log('\n🗑️ Suppression du livre de test...');
    try {
      const deleteResponse = await axios.delete(`${BASE_URL}/livres/${bookId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Livre supprimé:', deleteResponse.data);
    } catch (error) {
      console.log('❌ Erreur suppression:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Erreur lors du debug:', error.message);
    if (error.response) {
      console.error('📋 Détails:', error.response.data);
    }
  }
}

debugBookUpdate().catch(console.error);
