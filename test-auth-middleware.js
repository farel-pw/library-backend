const axios = require('axios');

const BASE_URL = 'http://localhost:4401';

async function testAuthMiddleware() {
  try {
    console.log('🔐 Test du middleware d\'authentification\n');

    // 1. Connexion
    const loginResponse = await axios.post(`${BASE_URL}/userlogin`, {
      email: 'admin@bibliotheque.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('🎫 Token obtenu');

    // 2. Test endpoint qui utilise req.user (GET profile)
    console.log('\n2️⃣ Test GET profile (utilise req.user)...');
    try {
      const response = await axios.get(`${BASE_URL}/utilisateurs/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ GET profile fonctionne');
    } catch (error) {
      console.log('❌ GET profile échoue:', error.response?.data);
    }

    // 3. Créer un endpoint de test pour débugger req.user
    console.log('\n3️⃣ Test de token décodage...');
    
    // Décoder manuellement le token
    const jwt = require('jsonwebtoken');
    const config = require('./src/config');
    
    try {
      const decoded = jwt.verify(token, config.secret);
      console.log('🔍 Token décodé manuellement:', decoded);
    } catch (decodeError) {
      console.log('❌ Erreur décodage token:', decodeError.message);
    }

    // 4. Test avec un token modifié pour voir la différence
    console.log('\n4️⃣ Test avec headers différents...');
    
    // Test avec Bearer
    try {
      const response1 = await axios.put(`${BASE_URL}/utilisateurs/profile`, 
        { nom: 'Test Bearer' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      console.log('✅ Test Bearer réussi:', response1.data);
    } catch (error1) {
      console.log('❌ Test Bearer échoué:', error1.response?.data);
    }

    // Test sans Bearer
    try {
      const response2 = await axios.put(`${BASE_URL}/utilisateurs/profile`, 
        { nom: 'Test Sans Bearer' },
        { headers: { 'Authorization': token } }
      );
      console.log('✅ Test sans Bearer réussi:', response2.data);
    } catch (error2) {
      console.log('❌ Test sans Bearer échoué:', error2.response?.data);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testAuthMiddleware().catch(console.error);
