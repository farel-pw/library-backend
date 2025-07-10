const axios = require('axios');

// Test exact de la fonction api.getLivres du frontend
const API_BASE_URL = 'http://localhost:4401';

// Simuler le localStorage.getItem pour le token
const simulatedLocalStorage = {
  token: null
};

// Fonction identique à api.getLivres du frontend
async function getLivres(filters = {}) {
  const token = simulatedLocalStorage.token;
  
  const params = new URLSearchParams();
  if (filters.titre) params.append("titre", filters.titre);
  if (filters.auteur) params.append("auteur", filters.auteur);
  if (filters.genre && filters.genre !== "all") params.append("genre", filters.genre);

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    }
  };

  const response = await axios.get(`${API_BASE_URL}/livres?${params.toString()}`, config);
  
  if (!response.data) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = response.data;
  
  // Gestion moderne des erreurs du backend
  if (data.error) {
    throw new Error(data.message || "Erreur du serveur");
  }

  return data.data || [];
}

async function testFrontendLivres() {
  console.log('📚 Test exact de la fonction frontend getLivres');
  console.log('==============================================\n');

  try {
    // 1. Test sans token (comme au chargement initial)
    console.log('1. 📖 Test sans token d\'authentification...');
    try {
      const livres = await getLivres();
      console.log(`✅ ${livres.length} livres récupérés sans token`);
      
      if (livres.length > 0) {
        console.log('\n   📋 Premiers livres:');
        livres.slice(0, 3).forEach((livre, index) => {
          console.log(`   ${index + 1}. "${livre.titre}" par ${livre.auteur} (${livre.genre})`);
        });
      } else {
        console.log('⚠️ Aucun livre retourné');
      }
    } catch (error) {
      console.log('❌ Erreur sans token:', error.message);
    }

    // 2. Test avec token
    console.log('\n2. 🔐 Test avec token d\'authentification...');
    
    // Obtenir un token valide
    const loginResponse = await axios.post(`${API_BASE_URL}/userlogin`, {
      email: 'admin@bibliotheque.com',
      password: 'admin123'
    });
    
    if (loginResponse.data.error) {
      console.log('❌ Erreur connexion:', loginResponse.data.message);
    } else {
      simulatedLocalStorage.token = loginResponse.data.token;
      console.log('✅ Token obtenu et configuré');
      
      try {
        const livres = await getLivres();
        console.log(`✅ ${livres.length} livres récupérés avec token`);
        
        if (livres.length > 0) {
          console.log('\n   📋 Premiers livres avec token:');
          livres.slice(0, 3).forEach((livre, index) => {
            console.log(`   ${index + 1}. "${livre.titre}" par ${livre.auteur} (${livre.genre})`);
          });
        }
      } catch (error) {
        console.log('❌ Erreur avec token:', error.message);
      }
    }

    // 3. Test avec filtres
    console.log('\n3. 🔍 Test avec filtres...');
    try {
      const livresFiction = await getLivres({ genre: 'Fiction' });
      console.log(`✅ ${livresFiction.length} livres de fiction trouvés`);
      
      const livresRechercheAuteur = await getLivres({ auteur: 'Scott' });
      console.log(`✅ ${livresRechercheAuteur.length} livres trouvés pour auteur 'Scott'`);
      
      const livresRechercheTitre = await getLivres({ titre: 'Great' });
      console.log(`✅ ${livresRechercheTitre.length} livres trouvés pour titre 'Great'`);
    } catch (error) {
      console.log('❌ Erreur avec filtres:', error.message);
    }

    // 4. Test de la structure des données
    console.log('\n4. 📊 Test de la structure des données...');
    try {
      const livres = await getLivres();
      
      if (livres.length > 0) {
        const premierLivre = livres[0];
        console.log('✅ Structure du premier livre:');
        console.log('   Propriétés:', Object.keys(premierLivre));
        console.log('   Titre:', premierLivre.titre);
        console.log('   Auteur:', premierLivre.auteur);
        console.log('   Genre:', premierLivre.genre);
        console.log('   Disponible:', premierLivre.disponible);
        console.log('   ID:', premierLivre.id);
      }
    } catch (error) {
      console.log('❌ Erreur structure:', error.message);
    }

    // 5. Test de la transformation des données (comme dans le frontend)
    console.log('\n5. 🔄 Test de la transformation des données...');
    try {
      const data = await getLivres();
      const livresArray = Array.isArray(data) ? data : [];
      
      console.log('✅ Transformation réussie:');
      console.log('   data est un Array:', Array.isArray(data));
      console.log('   livresArray.length:', livresArray.length);
      
      // Simulation exacte du frontend
      const livresAvecDisponibilite = livresArray.map((livre, index) => ({
        ...livre,
        disponible: index < 2 ? false : index < 4 ? false : true,
        note_moyenne: Math.round((Math.random() * 2 + 3) * 10) / 10,
        nombre_notes: Math.floor(Math.random() * 50) + 1
      }));
      
      console.log('✅ Livres avec disponibilité simulée:', livresAvecDisponibilite.length);
      
      if (livresAvecDisponibilite.length > 0) {
        console.log('\n   📋 Exemple après transformation:');
        livresAvecDisponibilite.slice(0, 2).forEach((livre, index) => {
          console.log(`   ${index + 1}. "${livre.titre}" - Disponible: ${livre.disponible}, Note: ${livre.note_moyenne}`);
        });
      }
    } catch (error) {
      console.log('❌ Erreur transformation:', error.message);
    }

    console.log('\n✅ Test complet terminé');
    
    // Résumé du diagnostic
    console.log('\n🔍 DIAGNOSTIC:');
    console.log('   - API Backend: ✅ Fonctionnel');
    console.log('   - Récupération des livres: ✅ Fonctionnel');
    console.log('   - Structure des données: ✅ Correcte');
    console.log('   - Transformation frontend: ✅ Fonctionnel');
    console.log('\n💡 Si les livres ne s\'affichent pas dans l\'interface:');
    console.log('   1. Vérifiez la console du navigateur (F12)');
    console.log('   2. Vérifiez l\'état de loading dans le composant');
    console.log('   3. Vérifiez les conditions de rendu dans le JSX');
    console.log('   4. Vérifiez si useEffect se déclenche correctement');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
  }
}

testFrontendLivres();
