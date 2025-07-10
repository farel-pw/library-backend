require('dotenv').config();
const http = require('http');

function testAPI() {
  const options = {
    hostname: 'localhost',
    port: 4401,
    path: '/api/analytics/dashboard',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('📡 Réponse de l\'API:');
      console.log('Status:', res.statusCode);
      try {
        const parsed = JSON.parse(data);
        console.log('Data:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Raw data:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erreur de connexion à l\'API:', error.message);
    console.log('💡 Assurez-vous que le serveur backend est démarré sur le port 4401');
    console.log('💡 Exécutez: node src/server.js dans le dossier Backend 2');
  });

  req.end();
}

console.log('🧪 Test de l\'API Analytics...');
testAPI();
