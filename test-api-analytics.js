const http = require('http');

function testAPI() {
  console.log('🧪 Test de l\'API Analytics...');
  
  const options = {
    hostname: 'localhost',
    port: 4401,
    path: '/api/analytics/dashboard',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📊 Status: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📈 Réponse reçue:');
      try {
        const parsedData = JSON.parse(data);
        console.log('✅ Données Analytics:', JSON.stringify(parsedData, null, 2));
      } catch (e) {
        console.log('❌ Erreur de parsing JSON:', e.message);
        console.log('📝 Données brutes:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erreur de requête:', error.message);
  });

  req.setTimeout(5000, () => {
    console.error('❌ Timeout de la requête');
    req.destroy();
  });

  req.end();
}

testAPI();
