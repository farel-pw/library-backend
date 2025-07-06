const http = require('http');

function testCommentCreation() {
  console.log('🧪 Test de création de commentaire...\n');

  // Se connecter avec le bon email
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
    email: 'jean.dupont@example.com',
    password: 'password123'  // Changé de 'mot_de_passe' à 'password'
  });

  const loginReq = http.request(loginOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('🔑 Test LOGIN:');
      console.log(`Status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        try {
          const loginResponse = JSON.parse(data);
          const token = loginResponse.token;
          
          if (token) {
            console.log('✅ Token obtenu:', token.substring(0, 20) + '...');
            
            // Créer un commentaire
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
              note: 4,
              commentaire: 'Excellent livre ! Je le recommande fortement. Test depuis l\'API.'
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
                  
                  if (res.statusCode === 201) {
                    console.log('✅ Commentaire créé avec succès !');
                    
                    // Vérifier en récupérant les commentaires du livre
                    setTimeout(() => {
                      const getOptions = {
                        hostname: 'localhost',
                        port: 4401,
                        path: '/commentaires/livre/1',
                        method: 'GET'
                      };

                      const getReq = http.request(getOptions, (res) => {
                        let getData = '';
                        res.on('data', (chunk) => getData += chunk);
                        res.on('end', () => {
                          console.log('\n📚 Vérification - GET /commentaires/livre/1:');
                          try {
                            const comments = JSON.parse(getData);
                            console.log(`Nombre de commentaires: ${comments.data.length}`);
                            comments.data.forEach((comment, index) => {
                              console.log(`${index + 1}. ${comment.utilisateur_prenom} ${comment.utilisateur_nom}: ${comment.note}/5 - "${comment.commentaire.substring(0, 50)}..."`);
                            });
                          } catch (e) {
                            console.log('Erreur parsing:', e.message);
                          }
                        });
                      });
                      getReq.end();
                    }, 500);
                  }
                } catch (e) {
                  console.log('Réponse brute:', commentResponse);
                }
              });
            });

            commentReq.on('error', (e) => {
              console.error(`❌ Erreur POST comment: ${e.message}`);
            });

            commentReq.write(commentData);
            commentReq.end();
          } else {
            console.log('❌ Pas de token dans la réponse');
          }
        } catch (e) {
          console.log('❌ Erreur parsing login response:', e.message);
          console.log('Réponse brute:', data);
        }
      } else {
        console.log('❌ Échec de connexion, réponse:', data);
      }
    });
  });

  loginReq.on('error', (e) => {
    console.error(`❌ Erreur login: ${e.message}`);
  });

  loginReq.write(loginData);
  loginReq.end();
}

testCommentCreation();
