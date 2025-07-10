const axios = require('axios');

const BASE_URL = 'http://localhost:4401';

async function testCommentsAPI() {
  console.log('🧪 Test de l\'API des commentaires');
  console.log('=====================================\n');

  try {
    // 1. Test de connexion pour obtenir un token
    console.log('1. 🔐 Test de connexion...');
    const loginResponse = await axios.post(`${BASE_URL}/userlogin`, {
      email: 'jean.dupont@example.com',
      password: 'password123'
    });
    
    if (loginResponse.data.error) {
      console.log('❌ Erreur de connexion:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie, token obtenu');

    // 2. Récupérer les livres pour avoir un livre_id
    console.log('\n2. 📚 Récupération des livres...');
    const booksResponse = await axios.get(`${BASE_URL}/livres`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (booksResponse.data.error || !booksResponse.data.data || booksResponse.data.data.length === 0) {
      console.log('❌ Aucun livre trouvé');
      return;
    }
    
    const livre_id = booksResponse.data.data[0].id;
    console.log(`✅ Livre trouvé (ID: ${livre_id})`);

    // 3. Tester la récupération des commentaires d'un livre
    console.log('\n3. 📖 Test récupération des commentaires d\'un livre...');
    try {
      const commentsResponse = await axios.get(`${BASE_URL}/commentaires/livre/${livre_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (commentsResponse.data.error) {
        console.log('❌ Erreur:', commentsResponse.data.message);
      } else {
        console.log(`✅ Commentaires récupérés: ${commentsResponse.data.data.length} commentaires`);
      }
    } catch (error) {
      console.log('❌ Erreur lors de la récupération des commentaires:', error.response?.data?.message || error.message);
    }

    // 4. Tester la création d'un commentaire
    console.log('\n4. ✍️ Test création d\'un commentaire...');
    try {
      const newCommentResponse = await axios.post(`${BASE_URL}/commentaires`, {
        livre_id: livre_id,
        commentaire: 'Test de commentaire depuis l\'API - ' + new Date().toISOString(),
        note: 4
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (newCommentResponse.data.error) {
        console.log('❌ Erreur création commentaire:', newCommentResponse.data.message);
      } else {
        console.log('✅ Commentaire créé avec succès:', newCommentResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Erreur lors de la création du commentaire:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message || error.message);
      console.log('   Data:', error.response?.data);
    }

    // 5. Tester la récupération des commentaires de la bibliothèque
    console.log('\n5. 🏛️ Test récupération des commentaires de la bibliothèque...');
    try {
      const bibCommentsResponse = await axios.get(`${BASE_URL}/commentaires/bibliotheque`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (bibCommentsResponse.data.error) {
        console.log('❌ Erreur:', bibCommentsResponse.data.message);
      } else {
        console.log(`✅ Commentaires bibliothèque récupérés: ${bibCommentsResponse.data.data.length} commentaires`);
      }
    } catch (error) {
      console.log('❌ Erreur lors de la récupération des commentaires bibliothèque:', error.response?.data?.message || error.message);
    }

    // 6. Tester la création d'un commentaire sur la bibliothèque
    console.log('\n6. 🏛️✍️ Test création d\'un commentaire sur la bibliothèque...');
    try {
      const newBibCommentResponse = await axios.post(`${BASE_URL}/commentaires/bibliotheque`, {
        commentaire: 'Test de commentaire bibliothèque - ' + new Date().toISOString(),
        note: 5
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (newBibCommentResponse.data.error) {
        console.log('❌ Erreur création commentaire bibliothèque:', newBibCommentResponse.data.message);
      } else {
        console.log('✅ Commentaire bibliothèque créé avec succès:', newBibCommentResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Erreur lors de la création du commentaire bibliothèque:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message || error.message);
    }

    console.log('\n✅ Tests terminés');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Assurez-vous que le serveur backend est démarré sur le port 4401');
    }
  }
}

testCommentsAPI();
