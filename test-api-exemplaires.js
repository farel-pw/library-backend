require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:4401';

async function testAPI() {
  try {
    console.log('🚀 Test de l\'API avec système d\'exemplaires\n');

    // 1. Tester la récupération des livres
    console.log('📚 1. Test de récupération des livres...');
    try {
      const response = await axios.get(`${API_BASE_URL}/livres`);
      const livresData = response.data.data || response.data; // Gérer les deux formats
      const livres = Array.isArray(livresData) ? livresData : [];
      
      console.log(`✅ ${livres.length} livres récupérés`);
      
      if (livres.length > 0) {
        console.log('\n📋 Exemples de livres avec disponibilité:');
        livres.slice(0, 3).forEach(livre => {
          console.log(`   📖 "${livre.titre}"`);
          console.log(`      Exemplaires: ${livre.exemplaires_disponibles}/${livre.exemplaires_total}`);
          console.log(`      Statut: ${livre.statut}`);
          console.log(`      Disponible pour emprunt: ${livre.exemplaires_disponibles > 0 ? 'Oui' : 'Non'}`);
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des livres:', error.message);
    }

    // 2. Simuler une authentification pour tester les emprunts
    console.log('\n🔐 2. Test d\'authentification...');
    let token = null;
    try {
      const authResponse = await axios.post(`${API_BASE_URL}/userlogin`, {
        email: 'jean.dupont@example.com',
        password: 'password123'
      });
      
      token = authResponse.data.token;
      console.log('✅ Authentification réussie');
      
      // Headers avec token pour les requêtes suivantes
      const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // 3. Tester l'emprunt d'un livre
      console.log('\n📖 3. Test d\'emprunt de livre...');
      try {
        // D'abord, récupérer les livres pour trouver un livre disponible
        const livresResponse = await axios.get(`${API_BASE_URL}/livres`, { headers: authHeaders });
        const livresData = livresResponse.data.data || livresResponse.data;
        const livresDisponibles = (Array.isArray(livresData) ? livresData : []).filter(livre => livre.exemplaires_disponibles > 0);
        
        if (livresDisponibles.length > 0) {
          const livre = livresDisponibles[0];
          console.log(`   📚 Tentative d'emprunt: "${livre.titre}"`);
          console.log(`   📊 Avant emprunt: ${livre.exemplaires_disponibles}/${livre.exemplaires_total} exemplaires disponibles`);
          
          const empruntResponse = await axios.post(`${API_BASE_URL}/emprunts`, {
            livre_id: livre.id
          }, { headers: authHeaders });
          
          console.log('✅ Emprunt créé avec succès');
          console.log(`   📅 ID emprunt: ${empruntResponse.data.id}`);
          
          // Vérifier la nouvelle disponibilité
          const livresApreEmprunt = await axios.get(`${API_BASE_URL}/livres`, { headers: authHeaders });
          const livresDataApres = livresApreEmprunt.data.data || livresApreEmprunt.data;
          const livreApresEmprunt = (Array.isArray(livresDataApres) ? livresDataApres : []).find(l => l.id === livre.id);
          console.log(`   📊 Après emprunt: ${livreApresEmprunt.exemplaires_disponibles}/${livreApresEmprunt.exemplaires_total} exemplaires disponibles`);
          
          if (livreApresEmprunt.exemplaires_disponibles === livre.exemplaires_disponibles - 1) {
            console.log('✅ Disponibilité mise à jour correctement');
          } else {
            console.log('❌ Erreur dans la mise à jour de disponibilité');
          }
        } else {
          console.log('⚠️  Aucun livre disponible pour test d\'emprunt');
        }
      } catch (error) {
        console.error('❌ Erreur lors de l\'emprunt:', error.response?.data?.message || error.message);
      }

      // 4. Tester la récupération des emprunts
      console.log('\n📅 4. Test de récupération des emprunts...');
      try {
        const empruntsResponse = await axios.get(`${API_BASE_URL}/emprunts`, { headers: authHeaders });
        const empruntsData = empruntsResponse.data.data || empruntsResponse.data;
        const emprunts = Array.isArray(empruntsData) ? empruntsData : [];
        
        console.log(`✅ ${emprunts.length} emprunt(s) récupéré(s)`);
        
        if (emprunts.length > 0) {
          console.log('\n📋 Emprunts actifs:');
          emprunts.filter(e => !e.rendu).forEach(emprunt => {
            console.log(`   📖 "${emprunt.titre}" par ${emprunt.auteur}`);
            console.log(`      📅 Emprunté le: ${new Date(emprunt.date_emprunt).toLocaleDateString()}`);
            console.log(`      📅 À rendre le: ${new Date(emprunt.date_retour_prevue).toLocaleDateString()}`);
          });
        }
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des emprunts:', error.response?.data?.message || error.message);
      }

    } catch (error) {
      console.error('❌ Erreur d\'authentification:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Test API terminé !');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testAPI();
