const axios = require('axios');

const BASE_URL = 'http://localhost:4401';

async function testFrontendAuth() {
  console.log('🔐 Test de l\'authentification frontend');
  console.log('========================================\n');

  try {
    // 1. Test avec différents utilisateurs
    const testUsers = [
      { email: 'admin@bibliotheque.com', password: 'admin123' },
      { email: 'jean.dupont@example.com', password: 'password123' },
      { email: 'fankoufarida@2ie.edu', password: 'password123' },
      { email: 'kouasseumartial@2ie.edu', password: 'password123' }
    ];

    for (const user of testUsers) {
      console.log(`\n🔍 Test avec ${user.email}:`);
      
      try {
        const loginResponse = await axios.post(`${BASE_URL}/userlogin`, {
          email: user.email,
          password: user.password
        });
        
        if (loginResponse.data.error) {
          console.log('❌ Erreur de connexion:', loginResponse.data.message);
          continue;
        }
        
        const token = loginResponse.data.token;
        const userInfo = loginResponse.data.user;
        console.log(`✅ Connexion réussie: ${userInfo.prenom} ${userInfo.nom} (${userInfo.role})`);
        
        // Test d'ajout de commentaire avec ce token
        console.log('   🧪 Test d\'ajout de commentaire...');
        const commentResponse = await axios.post(`${BASE_URL}/commentaires`, {
          livre_id: 1,
          commentaire: `Test commentaire de ${userInfo.prenom} - ${new Date().toLocaleString()}`,
          note: 5
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (commentResponse.data.error) {
          console.log('   ❌ Erreur commentaire:', commentResponse.data.message);
        } else {
          console.log('   ✅ Commentaire ajouté avec succès!');
        }
        
        // Test de récupération des commentaires utilisateur
        console.log('   📖 Test récupération commentaires utilisateur...');
        const userCommentsResponse = await axios.get(`${BASE_URL}/commentaires/user`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (userCommentsResponse.data.error) {
          console.log('   ❌ Erreur récupération:', userCommentsResponse.data.message);
        } else {
          console.log(`   ✅ Commentaires utilisateur: ${userCommentsResponse.data.data.length}`);
        }
        
      } catch (error) {
        console.log(`❌ Erreur avec ${user.email}:`, error.response?.data?.message || error.message);
      }
    }

    // 2. Test avec des mots de passe par défaut si les tests échouent
    console.log('\n🔧 Test avec des mots de passe par défaut:');
    const defaultPasswords = ['password123', 'admin123', '123456', 'password'];
    
    for (const password of defaultPasswords) {
      try {
        const loginResponse = await axios.post(`${BASE_URL}/userlogin`, {
          email: 'jean.dupont@example.com',
          password: password
        });
        
        if (!loginResponse.data.error) {
          console.log(`✅ Mot de passe trouvé pour jean.dupont@example.com: ${password}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Échec avec mot de passe: ${password}`);
      }
    }

    console.log('\n✅ Tests d\'authentification terminés');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testFrontendAuth();
