const http = require('http');

function testMultipleRoutes() {
  const routes = [
    '/analytics/dashboard',
    '/api/analytics/dashboard',
    '/',
    '/analytics',
    '/emprunts',
    '/utilisateurs'
  ];

  routes.forEach((route, index) => {
    setTimeout(() => {
      console.log(`🧪 Test route ${index + 1}/${routes.length}: ${route}`);
      
      const options = {
        hostname: 'localhost',
        port: 4401,
        path: route,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        console.log(`📊 ${route} -> Status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const parsedData = JSON.parse(data);
              console.log(`✅ ${route} -> Données:`, JSON.stringify(parsedData, null, 2));
            } catch (e) {
              console.log(`📝 ${route} -> Réponse:`, data.substring(0, 100) + '...');
            }
          } else {
            console.log(`❌ ${route} -> Erreur:`, data);
          }
          console.log('---');
        });
      });

      req.on('error', (error) => {
        console.error(`❌ ${route} -> Erreur de requête:`, error.message);
      });

      req.setTimeout(3000, () => {
        console.error(`❌ ${route} -> Timeout`);
        req.destroy();
      });

      req.end();
    }, index * 500); // Délai entre chaque test
  });
}

testMultipleRoutes();
