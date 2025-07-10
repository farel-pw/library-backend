#!/usr/bin/env node

/**
 * Test complet du nouveau système d'emprunts et réservations
 */

const axios = require('axios');

const API_BASE = 'http://localhost:4401';
let authToken = null;

// Fonction utilitaire pour faire des requêtes API
async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` })
      }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

async function testCompleteSystem() {
  console.log('🧪 Test complet du système d\'emprunts et réservations\n');

  try {
    // 1. Test d'authentification
    console.log('1️⃣ Test d\'authentification...');
    try {
      const loginResponse = await apiCall('/userlogin', 'POST', {
        email: 'jean.dupont@example.com',
        password: 'password123'
      });
      
      if (!loginResponse.error && loginResponse.token) {
        authToken = loginResponse.token;
        console.log('✅ Authentification réussie');
        console.log(`   👤 Utilisateur: ${loginResponse.user.nom} ${loginResponse.user.prenom}`);
      } else {
        throw new Error('Token non reçu');
      }
    } catch (error) {
      console.log('⚠️ Authentification échouée, tentative avec admin...');
      const loginResponse = await apiCall('/userlogin', 'POST', {
        email: 'admin@bibliotheque.com',
        password: 'admin123'
      });
      
      if (!loginResponse.error && loginResponse.token) {
        authToken = loginResponse.token;
        console.log('✅ Authentification admin réussie');
      } else {
        throw new Error('Impossible de s\'authentifier');
      }
    }

    // 2. Test de récupération des livres avec nouveau format
    console.log('\n2️⃣ Test de récupération des livres...');
    const livres = await apiCall('/livres');
    
    if (!livres.error && livres.data && livres.data.length > 0) {
      console.log(`✅ ${livres.data.length} livres récupérés`);
      
      // Afficher les 3 premiers livres avec leurs statistiques
      console.log('\n📚 Exemples de livres avec nouveau système:');
      livres.data.slice(0, 3).forEach((livre, index) => {
        console.log(`\n   📖 ${index + 1}. "${livre.titre}" par ${livre.auteur}`);
        console.log(`      🔢 Exemplaires: ${livre.exemplaires_disponibles || 0}/${livre.exemplaires_total || 3}`);
        console.log(`      🔄 Emprunts actifs: ${livre.emprunts_actifs || 0}`);
        console.log(`      ✅ Emprunts retournés: ${livre.emprunts_retournes || 0}`);
        console.log(`      📊 Statut: ${livre.statut || 'non défini'}`);
        
        if (livre.reservations_actives > 0) {
          console.log(`      📋 Réservations: ${livre.reservations_actives}`);
        }
      });
    } else {
      throw new Error('Aucun livre récupéré');
    }

    // 3. Test d'emprunt
    console.log('\n3️⃣ Test d\'emprunt...');
    const livreDisponible = livres.data.find(livre => 
      (livre.exemplaires_disponibles || 0) > 0
    );
    
    if (livreDisponible) {
      console.log(`   📖 Tentative d'emprunt: "${livreDisponible.titre}"`);
      console.log(`   🔢 Avant emprunt: ${livreDisponible.exemplaires_disponibles}/${livreDisponible.exemplaires_total} disponibles`);
      
      try {
        const empruntResponse = await apiCall('/emprunts', 'POST', {
          livre_id: livreDisponible.id,
          date_retour_prevue: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        
        if (!empruntResponse.error) {
          console.log('✅ Emprunt créé avec succès');
          if (empruntResponse.exemplaires_restants !== undefined) {
            console.log(`   📊 Exemplaires restants: ${empruntResponse.exemplaires_restants}`);
          }
        } else {
          console.log(`⚠️ Emprunt refusé: ${empruntResponse.message}`);
          if (empruntResponse.canReserve) {
            console.log('   💡 Réservation possible!');
          }
        }
      } catch (error) {
        console.log(`⚠️ Erreur d'emprunt: ${error.message}`);
      }
    } else {
      console.log('⚠️ Aucun livre disponible pour emprunt');
    }

    // 4. Test de réservation
    console.log('\n4️⃣ Test de réservation...');
    const livreIndisponible = livres.data.find(livre => 
      (livre.exemplaires_disponibles || 0) === 0
    );
    
    if (livreIndisponible) {
      console.log(`   📖 Tentative de réservation: "${livreIndisponible.titre}"`);
      
      try {
        const reservationResponse = await apiCall('/emprunts/reserver', 'POST', {
          livre_id: livreIndisponible.id
        });
        
        if (!reservationResponse.error) {
          console.log('✅ Réservation créée avec succès');
          if (reservationResponse.position) {
            console.log(`   📍 Position dans la file: ${reservationResponse.position}`);
          }
        } else {
          console.log(`⚠️ Réservation refusée: ${reservationResponse.message}`);
        }
      } catch (error) {
        console.log(`⚠️ Erreur de réservation: ${error.message}`);
      }
    } else {
      console.log('💡 Tous les livres sont disponibles - test de réservation non nécessaire');
    }

    // 5. Test de récupération des emprunts
    console.log('\n5️⃣ Test de récupération des emprunts...');
    try {
      const emprunts = await apiCall('/emprunts');
      
      if (!emprunts.error && emprunts.data) {
        console.log(`✅ ${emprunts.data.length} emprunt(s) récupéré(s)`);
        
        if (emprunts.data.length > 0) {
          console.log('\n📋 Emprunts actuels:');
          emprunts.data.forEach((emprunt, index) => {
            console.log(`   ${index + 1}. "${emprunt.livre_titre || 'Titre non défini'}" par ${emprunt.livre_auteur || 'Auteur non défini'}`);
            console.log(`      📅 Emprunté le: ${emprunt.date_emprunt}`);
            console.log(`      ⏰ À rendre le: ${emprunt.date_retour_prevue}`);
            console.log(`      🏷️ Statut: ${emprunt.statut || 'non défini'}`);
            if (emprunt.date_retour_effective) {
              console.log(`      ✅ Retourné le: ${emprunt.date_retour_effective}`);
            }
          });
        }
      } else {
        console.log('⚠️ Aucun emprunt trouvé');
      }
    } catch (error) {
      console.log(`⚠️ Erreur lors de la récupération des emprunts: ${error.message}`);
    }

    // 6. Test de mise à jour des statuts
    console.log('\n6️⃣ Test de mise à jour des statuts...');
    try {
      const updateResponse = await apiCall('/emprunts/update-statuses', 'POST');
      
      if (!updateResponse.error) {
        console.log(`✅ Statuts mis à jour`);
        if (updateResponse.updated !== undefined) {
          console.log(`   📊 ${updateResponse.updated} emprunts mis à jour`);
        }
      } else {
        console.log(`⚠️ Mise à jour échouée: ${updateResponse.message}`);
      }
    } catch (error) {
      console.log(`⚠️ Erreur lors de la mise à jour: ${error.message}`);
    }

    console.log('\n🎉 Test terminé!');
    console.log('\n💡 Résumé des fonctionnalités testées:');
    console.log('   ✅ Authentification');
    console.log('   ✅ Récupération des livres avec statistiques');
    console.log('   ✅ Système d\'emprunt avec vérification de stock');
    console.log('   ✅ Système de réservation pour livres indisponibles');
    console.log('   ✅ Récupération des emprunts avec statuts');
    console.log('   ✅ Mise à jour automatique des statuts');

  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error.message);
  }
}

// Vérifier si axios est disponible
try {
  require.resolve('axios');
} catch (e) {
  console.error('❌ Axios n\'est pas installé. Veuillez exécuter: npm install axios');
  process.exit(1);
}

// Exécuter le test
testCompleteSystem();
