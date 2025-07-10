const http = require('http');

function testBooksAPI() {
  console.log('📚 Test de l\'API des livres...\n');

  // Test GET /livres
  const getBooksOptions = {
    hostname: 'localhost',
    port: 4401,
    path: '/livres',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const getBooksReq = http.request(getBooksOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('📖 Test GET /livres:');
      console.log(`Status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        try {
          const booksResponse = JSON.parse(data);
          console.log('✅ Livres récupérés avec succès!');
          console.log(`📊 Nombre de livres: ${booksResponse.data ? booksResponse.data.length : 'N/A'}`);
          
          if (booksResponse.data && booksResponse.data.length > 0) {
            console.log('\n📚 Premiers livres:');
            booksResponse.data.slice(0, 3).forEach((livre, index) => {
              console.log(`${index + 1}. "${livre.titre}" par ${livre.auteur}`);
              console.log(`   Genre: ${livre.genre} | Disponible: ${livre.disponible ? 'Oui' : 'Non'}`);
            });
          }
        } catch (e) {
          console.log('❌ Erreur parsing response:', e.message);
          console.log('Réponse brute:', data);
        }
      } else {
        console.log('❌ Erreur récupération livres, réponse:', data);
      }
    });
  });

  getBooksReq.on('error', (e) => {
    console.error(`❌ Erreur requête livres: ${e.message}`);
    console.log('🔍 Vérifiez que le serveur backend est démarré sur le port 4401');
  });

  getBooksReq.end();
}

testBooksAPI();
