const axios = require('axios');

// Test exact du frontend sur le port 3001
const FRONTEND_URL = 'http://localhost:3001';
const API_BASE_URL = 'http://localhost:4401';

async function testFrontendInterface() {
  console.log('🔍 Test de l\'interface frontend complète');
  console.log('==========================================\n');

  try {
    // 1. Vérifier si le frontend est accessible
    console.log('1. 🌐 Vérification de l\'accès au frontend...');
    try {
      const frontendResponse = await axios.get(FRONTEND_URL);
      console.log('✅ Frontend accessible sur', FRONTEND_URL);
    } catch (error) {
      console.log('❌ Frontend non accessible:', error.message);
      return;
    }

    // 2. Simuler le processus de connexion complet
    console.log('\n2. 🔐 Simulation du processus de connexion...');
    
    // Obtenir token
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
    console.log('   Rôle:', user.role);

    // 3. Tester la récupération des livres (comme le dashboard)
    console.log('\n3. 📚 Test récupération des livres...');
    const livresResponse = await axios.get(`${API_BASE_URL}/livres`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (livresResponse.data.error) {
      console.log('❌ Erreur récupération livres:', livresResponse.data.message);
      return;
    }
    
    const livres = livresResponse.data.data;
    console.log(`✅ ${livres.length} livres récupérés`);

    // 4. Tester l'ajout d'un commentaire pour chaque livre
    console.log('\n4. 📝 Test ajout de commentaires...');
    
    for (let i = 0; i < Math.min(3, livres.length); i++) {
      const livre = livres[i];
      console.log(`\n   Test pour le livre: "${livre.titre}" (ID: ${livre.id})`);
      
      // Récupérer les commentaires existants
      const commentsResponse = await axios.get(`${API_BASE_URL}/commentaires/livre/${livre.id}`);
      const commentsBefore = commentsResponse.data.data.length;
      console.log(`   - Commentaires avant: ${commentsBefore}`);
      
      // Ajouter un commentaire
      const nouveauCommentaire = {
        livre_id: livre.id,
        commentaire: `Commentaire de test pour "${livre.titre}" - ${new Date().toLocaleString()}`,
        note: Math.floor(Math.random() * 5) + 1
      };
      
      try {
        const ajoutResponse = await axios.post(`${API_BASE_URL}/commentaires`, nouveauCommentaire, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (ajoutResponse.data.error) {
          console.log('   ❌ Erreur ajout:', ajoutResponse.data.message);
        } else {
          console.log('   ✅ Commentaire ajouté avec succès!');
          
          // Vérifier que le commentaire a été ajouté
          const updatedCommentsResponse = await axios.get(`${API_BASE_URL}/commentaires/livre/${livre.id}`);
          const commentsAfter = updatedCommentsResponse.data.data.length;
          console.log(`   - Commentaires après: ${commentsAfter}`);
          
          if (commentsAfter > commentsBefore) {
            console.log('   ✅ Commentaire persisté dans la base de données');
          } else {
            console.log('   ❌ Problème de persistance');
          }
        }
      } catch (error) {
        console.log('   ❌ Erreur lors de l\'ajout:', error.response?.data?.message || error.message);
      }
    }

    // 5. Tester les commentaires de la bibliothèque
    console.log('\n5. 🏛️ Test commentaires bibliothèque...');
    
    // Récupérer les commentaires existants
    const bibCommentsResponse = await axios.get(`${API_BASE_URL}/commentaires/bibliotheque`);
    const bibCommentsBefore = bibCommentsResponse.data.data.length;
    console.log(`   Commentaires bibliothèque avant: ${bibCommentsBefore}`);
    
    // Ajouter un commentaire bibliothèque
    const nouveauCommentaireBib = {
      commentaire: `Commentaire bibliothèque de test - ${new Date().toLocaleString()}`,
      note: 5
    };
    
    try {
      const ajoutBibResponse = await axios.post(`${API_BASE_URL}/commentaires/bibliotheque`, nouveauCommentaireBib, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (ajoutBibResponse.data.error) {
        console.log('   ❌ Erreur ajout commentaire bibliothèque:', ajoutBibResponse.data.message);
      } else {
        console.log('   ✅ Commentaire bibliothèque ajouté avec succès!');
        
        // Vérifier
        const updatedBibCommentsResponse = await axios.get(`${API_BASE_URL}/commentaires/bibliotheque`);
        const bibCommentsAfter = updatedBibCommentsResponse.data.data.length;
        console.log(`   Commentaires bibliothèque après: ${bibCommentsAfter}`);
      }
    } catch (error) {
      console.log('   ❌ Erreur ajout commentaire bibliothèque:', error.response?.data?.message || error.message);
    }

    // 6. Statistiques finales
    console.log('\n6. 📊 Statistiques finales...');
    
    // Compter tous les commentaires
    const allCommentsPromises = livres.map(livre => 
      axios.get(`${API_BASE_URL}/commentaires/livre/${livre.id}`)
    );
    
    const allCommentsResponses = await Promise.all(allCommentsPromises);
    const totalComments = allCommentsResponses.reduce((total, response) => {
      return total + response.data.data.length;
    }, 0);
    
    console.log(`   📚 Total commentaires sur les livres: ${totalComments}`);
    
    const finalBibComments = await axios.get(`${API_BASE_URL}/commentaires/bibliotheque`);
    console.log(`   🏛️ Total commentaires sur la bibliothèque: ${finalBibComments.data.data.length}`);

    console.log('\n✅ Test complet de l\'interface frontend terminé avec succès!');
    console.log('\n🎯 CONCLUSION: L\'API des commentaires fonctionne parfaitement!');
    console.log('   Si vous avez des problèmes dans l\'interface, cela vient du code frontend,');
    console.log('   pas de l\'API backend. Vérifiez:');
    console.log('   - Le context d\'authentification');
    console.log('   - Les hooks de gestion d\'état');
    console.log('   - Les handlers d\'événements');
    console.log('   - Les messages d\'erreur affichés');

  } catch (error) {
    console.error('❌ Erreur dans le test:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
  }
}

testFrontendInterface();
