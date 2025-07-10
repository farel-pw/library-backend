#!/usr/bin/env node

/**
 * 📋 DEMONSTRATION COMPLETE DU SYSTÈME DE RÉSERVATION
 * 
 * Ce script montre étape par étape comment fonctionne le système de réservation
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

async function demonstrationReservation() {
  console.log('📋 DÉMONSTRATION COMPLÈTE DU SYSTÈME DE RÉSERVATION\n');

  try {
    // 1. Authentification
    console.log('🔐 ÉTAPE 1: Authentification');
    const loginResponse = await apiCall('/userlogin', 'POST', {
      email: 'marie.martin@example.com',
      password: 'password123'
    });
    
    if (!loginResponse.error && loginResponse.token) {
      authToken = loginResponse.token;
      console.log(`✅ Connecté en tant que: ${loginResponse.user.nom} ${loginResponse.user.prenom}`);
      console.log(`👤 ID Utilisateur: ${loginResponse.user.id}\n`);
    } else {
      throw new Error('Impossible de se connecter');
    }

    // 2. Voir l'état initial des livres
    console.log('📚 ÉTAPE 2: État initial des livres');
    const livres = await apiCall('/livres');
    
    if (!livres.error && livres.data && livres.data.length > 0) {
      console.log('📋 Livres disponibles:');
      livres.data.forEach((livre, index) => {
        const available = livre.exemplaires_disponibles || 0;
        const total = livre.exemplaires_total || 3;
        const reservations = livre.reservations_actives || 0;
        const status = available > 0 ? '🟢 DISPONIBLE' : '🔴 COMPLET';
        
        console.log(`   ${index + 1}. "${livre.titre}" - ${status}`);
        console.log(`      📖 Exemplaires: ${available}/${total}`);
        console.log(`      📋 Réservations actives: ${reservations}`);
      });
      console.log();
    }

    // 3. Trouver un livre indisponible (ou le rendre indisponible)
    console.log('🎯 ÉTAPE 3: Identification d\'un livre pour réservation');
    let livreAReserver = livres.data.find(livre => 
      (livre.exemplaires_disponibles || 0) === 0
    );

    if (!livreAReserver) {
      // Prendre le premier livre disponible et simuler qu'il soit complet
      livreAReserver = livres.data[0];
      console.log(`💡 Simulons que "${livreAReserver.titre}" soit complet pour la démonstration`);
    } else {
      console.log(`🎯 Livre sélectionné: "${livreAReserver.titre}" (déjà complet)`);
    }
    console.log();

    // 4. Tentative d'emprunt (devrait échouer si complet)
    console.log('🚫 ÉTAPE 4: Tentative d\'emprunt (attendu: échec si complet)');
    try {
      const empruntResponse = await apiCall('/emprunts', 'POST', {
        livre_id: livreAReserver.id,
        date_retour_prevue: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      
      if (empruntResponse.error) {
        console.log(`❌ Emprunt refusé: ${empruntResponse.message}`);
        if (empruntResponse.canReserve) {
          console.log('💡 Possibilité de réservation détectée!');
        }
      } else {
        console.log('✅ Emprunt autorisé (le livre était finalement disponible)');
      }
    } catch (error) {
      console.log(`❌ Erreur d'emprunt: ${error.message}`);
    }
    console.log();

    // 5. Création d'une réservation
    console.log('📋 ÉTAPE 5: Création d\'une réservation');
    try {
      const reservationResponse = await apiCall('/emprunts/reserver', 'POST', {
        livre_id: livreAReserver.id
      });
      
      if (!reservationResponse.error) {
        console.log('✅ Réservation créée avec succès!');
        console.log(`📍 Position dans la file: ${reservationResponse.position || 'N/A'}`);
        console.log(`🆔 ID de réservation: ${reservationResponse.id}`);
      } else {
        console.log(`❌ Réservation refusée: ${reservationResponse.message}`);
      }
    } catch (error) {
      console.log(`❌ Erreur de réservation: ${error.message}`);
    }
    console.log();

    // 6. Vérification des réservations de l'utilisateur
    console.log('📋 ÉTAPE 6: Mes réservations actuelles');
    try {
      const reservations = await apiCall('/reservations');
      
      if (!reservations.error && reservations.data && reservations.data.length > 0) {
        console.log(`✅ ${reservations.data.length} réservation(s) trouvée(s):`);
        reservations.data.forEach((res, index) => {
          console.log(`   ${index + 1}. "${res.titre}" par ${res.auteur}`);
          console.log(`      📅 Réservé le: ${res.date_reservation}`);
          console.log(`      📍 Position: ${res.position || 'N/A'}`);
          console.log(`      🏷️ Statut: ${res.statut}`);
        });
      } else {
        console.log('ℹ️ Aucune réservation trouvée');
      }
    } catch (error) {
      console.log(`⚠️ Erreur lors de la récupération des réservations: ${error.message}`);
    }
    console.log();

    // 7. Simulation d'un retour (pour montrer la promotion de file)
    console.log('🔄 ÉTAPE 7: Simulation de la gestion des retours');
    try {
      // Récupérer les emprunts en cours
      const emprunts = await apiCall('/emprunts');
      
      if (!emprunts.error && emprunts.data && emprunts.data.length > 0) {
        console.log('📋 Emprunts en cours:');
        emprunts.data.forEach((emprunt, index) => {
          console.log(`   ${index + 1}. "${emprunt.titre || 'Titre non défini'}" - Statut: ${emprunt.statut}`);
        });
        
        console.log('\n💡 Quand un utilisateur retourne un livre:');
        console.log('   1. Le statut de l\'emprunt passe à "retourne"');
        console.log('   2. La disponibilité du livre est recalculée');
        console.log('   3. Le premier utilisateur en file de réservation est notifié');
        console.log('   4. Il a 24h pour emprunter le livre sinon il passe au suivant');
      }
    } catch (error) {
      console.log(`⚠️ Erreur: ${error.message}`);
    }

    // 8. Explication du processus complet
    console.log('\n📚 RÉSUMÉ DU FONCTIONNEMENT DES RÉSERVATIONS');
    console.log('══════════════════════════════════════════════');
    
    console.log('\n🎯 1. QUAND UN LIVRE EST COMPLET (0/3 exemplaires):');
    console.log('   • Le bouton "Emprunter" devient "Réserver"');
    console.log('   • L\'utilisateur clique sur "Réserver"');
    console.log('   • Une réservation est créée avec statut "active"');
    console.log('   • L\'utilisateur reçoit sa position dans la file');
    
    console.log('\n📋 2. GESTION DE LA FILE D\'ATTENTE:');
    console.log('   • Les réservations sont triées par date (premier arrivé, premier servi)');
    console.log('   • Chaque utilisateur peut voir sa position');
    console.log('   • Impossible d\'avoir plusieurs réservations pour le même livre');
    
    console.log('\n🔄 3. QUAND UN LIVRE EST RETOURNÉ:');
    console.log('   • Le système détecte qu\'un exemplaire est disponible');
    console.log('   • Le premier de la file de réservation est notifié');
    console.log('   • Il a priorité pour emprunter le livre');
    console.log('   • Si il n\'emprunte pas dans les délais, on passe au suivant');
    
    console.log('\n✅ 4. AVANTAGES DU SYSTÈME:');
    console.log('   • Équitable: premier arrivé, premier servi');
    console.log('   • Transparent: position visible');
    console.log('   • Automatique: notifications automatiques');
    console.log('   • Intégré: synchronisé avec les emprunts');

    console.log('\n🎉 DÉMONSTRATION TERMINÉE!');

  } catch (error) {
    console.error('\n❌ Erreur lors de la démonstration:', error.message);
  }
}

// Vérifier si axios est disponible
try {
  require.resolve('axios');
} catch (e) {
  console.error('❌ Axios n\'est pas installé. Veuillez exécuter: npm install axios');
  process.exit(1);
}

// Exécuter la démonstration
demonstrationReservation();
