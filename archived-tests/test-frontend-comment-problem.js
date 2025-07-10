const axios = require('axios');

const BACKEND_URL = 'http://localhost:4401';
const FRONTEND_URL = 'http://localhost:3000';

async function testFrontendCommentProblem() {
  console.log('🔍 Diagnostic du problème de commentaires frontend\n');

  try {
    // 1. Tester la connexion au backend
    console.log('1. 🔗 Test de connexion au backend...');
    try {
      const backendResponse = await axios.get(`${BACKEND_URL}/`);
      console.log('✅ Backend accessible:', backendResponse.data.message);
    } catch (error) {
      console.log('❌ Backend inaccessible:', error.message);
      return;
    }

    // 2. Tester la connexion au frontend
    console.log('\n2. 🌐 Test de connexion au frontend...');
    try {
      const frontendResponse = await axios.get(`${FRONTEND_URL}/`);
      console.log('✅ Frontend accessible');
    } catch (error) {
      console.log('❌ Frontend inaccessible:', error.message);
      console.log('💡 Vérifiez que le frontend est bien lancé sur le port 3000');
    }

    // 3. Test d'authentification
    console.log('\n3. 🔐 Test d\'authentification...');
    let token = null;
    try {
      const loginResponse = await axios.post(`${BACKEND_URL}/userlogin`, {
        email: 'jean.dupont@example.com',
        password: 'password123'
      });
      
      if (loginResponse.data.error) {
        console.log('❌ Erreur de connexion:', loginResponse.data.message);
        return;
      }
      
      token = loginResponse.data.token;
      const user = loginResponse.data.user;
      console.log(`✅ Connexion réussie: ${user.prenom} ${user.nom} (ID: ${user.id})`);
    } catch (error) {
      console.log('❌ Erreur d\'authentification:', error.message);
      return;
    }

    // 4. Test des headers d'authentification
    console.log('\n4. 🎫 Test des headers d\'authentification...');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    console.log('Headers utilisés:', headers);

    // 5. Test d'ajout de commentaire avec différents formats
    console.log('\n5. 💬 Test d\'ajout de commentaire...');
    
    const commentData = {
      livre_id: 1,
      commentaire: 'Test commentaire depuis diagnostic - ' + new Date().toISOString(),
      note: 5
    };

    try {
      const commentResponse = await axios.post(`${BACKEND_URL}/commentaires`, commentData, {
        headers: headers
      });
      
      if (commentResponse.data.error) {
        console.log('❌ Erreur lors de l\'ajout:', commentResponse.data.message);
        console.log('Détails:', commentResponse.data);
      } else {
        console.log('✅ Commentaire ajouté avec succès!');
        console.log('Réponse:', commentResponse.data);
      }
    } catch (error) {
      console.log('❌ Erreur HTTP:', error.response?.status);
      console.log('Message:', error.response?.data?.message || error.message);
      console.log('Détails:', error.response?.data);
    }

    // 6. Test de récupération des commentaires
    console.log('\n6. 📖 Test de récupération des commentaires...');
    try {
      const getResponse = await axios.get(`${BACKEND_URL}/commentaires/livre/1`);
      if (getResponse.data.error) {
        console.log('❌ Erreur:', getResponse.data.message);
      } else {
        console.log(`✅ ${getResponse.data.data.length} commentaires récupérés`);
      }
    } catch (error) {
      console.log('❌ Erreur récupération:', error.message);
    }

    // 7. Test de simulation d'erreur frontend
    console.log('\n7. 🚨 Test de simulation d\'erreur frontend...');
    try {
      // Simuler une requête incorrecte
      const badResponse = await axios.post(`${BACKEND_URL}/commentaires`, {
        // Données manquantes intentionnellement
        commentaire: 'Test'
      }, {
        headers: headers
      });
      
      console.log('Réponse inattendue:', badResponse.data);
    } catch (error) {
      console.log('❌ Erreur attendue:', error.response?.data?.message || error.message);
    }

    // 8. Instructions pour l'utilisateur
    console.log('\n8. 📋 Instructions de débogage:\n');
    console.log('Si vous voyez encore "Impossible d\'ajouter les commentaires" :');
    console.log('1. Vérifiez que vous êtes connecté dans le frontend');
    console.log('2. Essayez de vous reconnecter');
    console.log('3. Vérifiez la console du navigateur (F12)');
    console.log('4. Vérifiez que le livre existe et a un ID valide');
    console.log('5. Vérifiez que le commentaire n\'est pas vide');
    console.log('\nSi le problème persiste, envoyez-moi :');
    console.log('- Les logs de la console du navigateur');
    console.log('- L\'erreur exacte affichée');
    console.log('- Les étapes que vous suivez');

  } catch (error) {
    console.error('❌ Erreur globale:', error.message);
  }
}

testFrontendCommentProblem();
