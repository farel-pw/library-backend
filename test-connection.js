const net = require('net');

function testConnection() {
  console.log('🔍 Test de connexion au serveur...');
  
  const client = new net.Socket();
  
  client.connect(4401, 'localhost', () => {
    console.log('✅ Connexion établie avec le serveur');
    
    // Envoyer une requête HTTP simple
    const request = 'GET /analytics/dashboard HTTP/1.1\r\nHost: localhost:4401\r\nConnection: close\r\n\r\n';
    client.write(request);
  });
  
  client.on('data', (data) => {
    console.log('📨 Réponse reçue:');
    console.log(data.toString());
  });
  
  client.on('close', () => {
    console.log('🔒 Connexion fermée');
  });
  
  client.on('error', (err) => {
    console.error('❌ Erreur de connexion:', err.message);
  });
}

testConnection();
