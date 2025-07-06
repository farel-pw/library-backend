const http = require('http');

function testCommentsAPI() {
  console.log('🧪 Test de l\'API Commentaires...\n');

  // Test 1: Récupérer les commentaires d'un livre
  const testGetComments = () => {
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 4401,
        path: '/commentaires/livre/1',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          console.log('📚 Test GET /commentaires/livre/1:');
          console.log(`Status: ${res.statusCode}`);
          try {
            const jsonData = JSON.parse(data);
            console.log('Réponse:', JSON.stringify(jsonData, null, 2));
          } catch (e) {
            console.log('Réponse brute:', data);
          }
          resolve();
        });
      });

      req.on('error', (e) => {
        console.error(`❌ Erreur GET comments: ${e.message}`);
        resolve();
      });

      req.end();
    });
  };

  // Test 2: Créer un commentaire (nécessite authentification)
  const testCreateComment = () => {
    return new Promise((resolve) => {
      // D'abord, se connecter pour avoir un token
      const loginOptions = {
        hostname: 'localhost',
        port: 4401,
        path: '/userlogin',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const loginData = JSON.stringify({
        email: 'jean.dupont@email.fr',
        mot_de_passe: 'password123'
      });

      const loginReq = http.request(loginOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          console.log('\n🔑 Test LOGIN pour token:');
          console.log(`Status: ${res.statusCode}`);
          
          if (res.statusCode === 200) {
            try {
              const loginResponse = JSON.parse(data);
              const token = loginResponse.data?.token;
              
              if (token) {
                console.log('✅ Token obtenu');
                
                // Maintenant créer un commentaire
                const commentOptions = {
                  hostname: 'localhost',
                  port: 4401,
                  path: '/commentaires',
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  }
                };

                const commentData = JSON.stringify({
                  livre_id: 1,
                  note: 5,
                  commentaire: 'Test commentaire depuis le script de test'
                });

                const commentReq = http.request(commentOptions, (res) => {
                  let commentResponse = '';
                  res.on('data', (chunk) => commentResponse += chunk);
                  res.on('end', () => {
                    console.log('\n💬 Test POST /commentaires:');
                    console.log(`Status: ${res.statusCode}`);
                    try {
                      const jsonData = JSON.parse(commentResponse);
                      console.log('Réponse:', JSON.stringify(jsonData, null, 2));
                    } catch (e) {
                      console.log('Réponse brute:', commentResponse);
                    }
                    resolve();
                  });
                });

                commentReq.on('error', (e) => {
                  console.error(`❌ Erreur POST comment: ${e.message}`);
                  resolve();
                });

                commentReq.write(commentData);
                commentReq.end();
              } else {
                console.log('❌ Pas de token dans la réponse de login');
                resolve();
              }
            } catch (e) {
              console.log('❌ Erreur parsing login response');
              resolve();
            }
          } else {
            console.log('❌ Échec de connexion');
            resolve();
          }
        });
      });

      loginReq.on('error', (e) => {
        console.error(`❌ Erreur login: ${e.message}`);
        resolve();
      });

      loginReq.write(loginData);
      loginReq.end();
    });
  };

  // Exécuter les tests
  testGetComments().then(() => {
    return testCreateComment();
  }).then(() => {
    console.log('\n✅ Tests terminés');
  });
}

testCommentsAPI();
