const axios = require('axios');

// Configuration identique au frontend
const API_BASE_URL = 'http://localhost:4401';

// Simulation exacte de la fonction apiCall du frontend
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem("token"); // Simuler localStorage
  
  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Gestion moderne des erreurs du backend
  if (data.error) {
    throw new Error(data.message || "Erreur du serveur");
  }

  return data;
}

// Simulation de localStorage
const localStorage = {
  token: null,
  getItem: function(key) {
    return this[key];
  },
  setItem: function(key, value) {
    this[key] = value;
  }
};

// Simulation de la fonction ajouterCommentaire du frontend
async function ajouterCommentaire(commentaire) {
  const response = await apiCall("/commentaires", {
    method: "POST",
    body: JSON.stringify(commentaire),
  });
  return response;
}

async function testProblemeUtilisateur() {
  console.log('🔍 Test du problème utilisateur avec commentaires');
  console.log('===============================================\n');

  try {
    // 1. Obtenir un token valide
    console.log('1. 🔐 Connexion...');
    const loginResponse = await axios.post(`${API_BASE_URL}/userlogin`, {
      email: 'jean.dupont@example.com',
      password: 'password123'
    });
    
    if (loginResponse.data.error) {
      console.log('❌ Erreur connexion:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.token;
    localStorage.setItem('token', token);
    console.log('✅ Connexion réussie');

    // 2. Tester l'ajout de commentaire exactement comme le frontend
    console.log('\n2. 💬 Test ajout commentaire...');
    const commentaireTest = {
      livre_id: 1,
      commentaire: 'Test utilisateur - ' + new Date().toLocaleString(),
      note: 5
    };

    console.log('📝 Données du commentaire:', commentaireTest);
    
    try {
      const result = await ajouterCommentaire(commentaireTest);
      console.log('✅ Commentaire ajouté avec succès!');
      console.log('   Réponse:', result);
    } catch (error) {
      console.log('❌ Erreur lors de l\'ajout du commentaire:');
      console.log('   Message:', error.message);
      
      // Tester directement avec axios pour comparer
      console.log('\n3. 🔧 Test direct avec axios...');
      try {
        const directResponse = await axios.post(`${API_BASE_URL}/commentaires`, commentaireTest, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ Axios direct réussi:', directResponse.data);
      } catch (axiosError) {
        console.log('❌ Axios direct échoué:', axiosError.response?.data);
      }
    }

    // 3. Tester avec fetch directement
    console.log('\n4. 🌐 Test direct avec fetch...');
    try {
      const fetchResponse = await fetch(`${API_BASE_URL}/commentaires`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commentaireTest)
      });
      
      console.log('Status fetch:', fetchResponse.status);
      const fetchData = await fetchResponse.json();
      console.log('Données fetch:', fetchData);
      
      if (fetchData.error) {
        console.log('❌ Erreur backend:', fetchData.message);
      } else {
        console.log('✅ Fetch réussi:', fetchData);
      }
    } catch (fetchError) {
      console.log('❌ Erreur fetch:', fetchError.message);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testProblemeUtilisateur();
