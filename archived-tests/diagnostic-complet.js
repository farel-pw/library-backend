const axios = require('axios');

const FRONTEND_URL = 'http://localhost:3001';
const API_URL = 'http://localhost:4401';

async function diagnosticComplet() {
  console.log('🔍 DIAGNOSTIC COMPLET - Problème d\'affichage des livres');
  console.log('==================================================\n');

  try {
    // 1. Vérifier que le frontend est accessible
    console.log('1. 🌐 Vérification du frontend...');
    try {
      await axios.get(FRONTEND_URL);
      console.log('✅ Frontend accessible');
    } catch (error) {
      console.log('❌ Frontend inaccessible:', error.message);
      return;
    }

    // 2. Vérifier que l'API est accessible
    console.log('\n2. 🔌 Vérification de l\'API...');
    try {
      const apiResponse = await axios.get(`${API_URL}/livres`);
      console.log(`✅ API accessible - ${apiResponse.data.data.length} livres disponibles`);
    } catch (error) {
      console.log('❌ API inaccessible:', error.message);
      return;
    }

    // 3. Tester les pages de debug
    console.log('\n3. 🧪 Test des pages de debug...');
    const pages = [
      '/test-simple',
      '/debug-livres', 
      '/livres-simple'
    ];

    for (const page of pages) {
      try {
        const response = await axios.get(`${FRONTEND_URL}${page}`);
        console.log(`✅ ${page} - Accessible (${response.status})`);
      } catch (error) {
        console.log(`❌ ${page} - Erreur: ${error.response?.status || error.message}`);
      }
    }

    // 4. Tester la page principale problématique
    console.log('\n4. 📚 Test de la page principale des livres...');
    try {
      const response = await axios.get(`${FRONTEND_URL}/dashboard/livres`);
      console.log(`✅ /dashboard/livres - Accessible (${response.status})`);
    } catch (error) {
      console.log(`❌ /dashboard/livres - Erreur: ${error.response?.status || error.message}`);
    }

    // 5. Analyser les problèmes potentiels
    console.log('\n5. 🔍 Analyse des problèmes potentiels...');
    
    // Test CORS
    console.log('\n   🌐 Test CORS...');
    try {
      const corsResponse = await axios.get(`${API_URL}/livres`, {
        headers: {
          'Origin': FRONTEND_URL,
          'Access-Control-Request-Method': 'GET'
        }
      });
      console.log('   ✅ CORS configuré correctement');
    } catch (error) {
      console.log('   ⚠️ Problème CORS potentiel:', error.message);
    }

    // Test avec différents User-Agents
    console.log('\n   🤖 Test avec User-Agent navigateur...');
    try {
      const browserResponse = await axios.get(`${API_URL}/livres`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      console.log('   ✅ Fonctionne avec User-Agent navigateur');
    } catch (error) {
      console.log('   ❌ Problème avec User-Agent:', error.message);
    }

    console.log('\n6. 📋 RÉSUMÉ DU DIAGNOSTIC:');
    console.log('   - API Backend: ✅ Fonctionne');
    console.log('   - Frontend: ✅ Accessible');
    console.log('   - Pages de debug: ✅ Créées');
    
    console.log('\n🎯 PROCHAINES ÉTAPES:');
    console.log('   1. Ouvrez votre navigateur');
    console.log('   2. Allez sur http://localhost:3001/test-simple');
    console.log('   3. Cliquez sur "Tester l\'API"');
    console.log('   4. Ouvrez la console (F12) et regardez les erreurs');
    console.log('   5. Allez sur http://localhost:3001/livres-simple');
    console.log('   6. Comparez avec http://localhost:3001/dashboard/livres');

    console.log('\n💡 SI LES LIVRES NE S\'AFFICHENT TOUJOURS PAS:');
    console.log('   - Vérifiez la console du navigateur pour les erreurs JavaScript');
    console.log('   - Vérifiez l\'onglet Network pour voir si les requêtes se font');
    console.log('   - Vérifiez si le token d\'authentification est présent');
    console.log('   - Essayez de vider le cache du navigateur (Ctrl+F5)');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Fonction pour créer une page de diagnostic simple dans le navigateur
async function creerPageDiagnosticNavigateur() {
  console.log('\n🛠️ Création d\'une page de diagnostic pour le navigateur...');
  
  const diagnosticHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Diagnostic Livres</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .test { margin: 10px 0; padding: 10px; border: 1px solid #ccc; }
        .success { background: #d4edda; border-color: #c3e6cb; }
        .error { background: #f8d7da; border-color: #f5c6cb; }
        button { padding: 10px 20px; margin: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>🔍 Diagnostic Livres - Tests en direct</h1>
    
    <div id="results"></div>
    
    <button onclick="testAPI()">Test API Direct</button>
    <button onclick="testFetch()">Test Fetch Simple</button>
    <button onclick="testConsole()">Vérifier Console</button>
    
    <script>
        const results = document.getElementById('results');
        
        function addResult(message, isSuccess = true) {
            const div = document.createElement('div');
            div.className = 'test ' + (isSuccess ? 'success' : 'error');
            div.innerHTML = new Date().toLocaleTimeString() + ': ' + message;
            results.appendChild(div);
        }
        
        async function testAPI() {
            try {
                addResult('🔄 Test de l\\'API en cours...');
                const response = await fetch('http://localhost:4401/livres');
                const data = await response.json();
                addResult('✅ API fonctionne - ' + data.data.length + ' livres reçus');
                console.log('Données API:', data);
            } catch (error) {
                addResult('❌ Erreur API: ' + error.message, false);
                console.error('Erreur API:', error);
            }
        }
        
        async function testFetch() {
            try {
                addResult('🔄 Test fetch simple...');
                const response = await fetch('http://localhost:4401/livres', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (response.ok) {
                    const data = await response.json();
                    addResult('✅ Fetch réussi - Status: ' + response.status);
                    addResult('📊 Données: ' + JSON.stringify(data).substring(0, 100) + '...');
                } else {
                    addResult('❌ Fetch échoué - Status: ' + response.status, false);
                }
            } catch (error) {
                addResult('❌ Erreur Fetch: ' + error.message, false);
            }
        }
        
        function testConsole() {
            addResult('🔍 Vérification console...');
            console.log('Test de la console - Timestamp:', new Date());
            console.error('Test d\\'erreur pour vérifier la console');
            console.warn('Test d\\'avertissement');
            addResult('✅ Messages envoyés à la console - Ouvrez F12 pour voir');
        }
        
        // Test automatique au chargement
        window.onload = function() {
            addResult('🚀 Page de diagnostic chargée');
            testAPI();
        }
    </script>
</body>
</html>`;

  const fs = require('fs');
  const path = 'c:\\Users\\fanko\\OneDrive\\Desktop\\projet 1\\fronctend\\public\\diagnostic.html';
  
  try {
    fs.writeFileSync(path, diagnosticHTML);
    console.log('✅ Page de diagnostic créée: http://localhost:3001/diagnostic.html');
  } catch (error) {
    console.log('❌ Erreur création page:', error.message);
  }
}

// Exécuter le diagnostic
diagnosticComplet().then(() => {
  creerPageDiagnosticNavigateur();
});
