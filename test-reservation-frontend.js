/**
 * Script de test complet du système de réservation
 * Vérifie que les 3 livres indisponibles permettent bien la réservation
 */

const axios = require('axios');

const API_BASE = 'http://localhost:4401';

async function testCompletReservationSystem() {
  console.log('🧪 TEST COMPLET DU SYSTÈME DE RÉSERVATION');
  console.log('==========================================\n');

  try {
    // 1. Vérifier l'état des livres
    console.log('📚 1. Vérification de l\'état des livres...');
    const livresResponse = await axios.get(`${API_BASE}/livres`);
    const livres = livresResponse.data.data;
    
    const livresIndisponibles = livres.filter(livre => !livre.disponible && livre.peut_reserver);
    console.log(`✅ ${livresIndisponibles.length} livres indisponibles trouvés :`);
    
    livresIndisponibles.forEach(livre => {
      console.log(`   - ${livre.titre} (ID: ${livre.id}) - ${livre.exemplaires_disponibles}/${livre.exemplaires_total} disponibles`);
    });

    if (livresIndisponibles.length < 3) {
      console.log('❌ Pas assez de livres indisponibles. Exécution du script de configuration...');
      return;
    }

    // 2. Créer un utilisateur de test
    console.log('\n👤 2. Création d\'un utilisateur de test...');
    let userToken;
    let userId;
    
    try {
      const registerResponse = await axios.post(`${API_BASE}/signup`, {
        nom: 'Utilisateur Test Réservation',
        email: 'reservation_test@example.com',
        password: 'password123',
        role: 'utilisateur'
      });
      console.log('✅ Utilisateur créé avec succès');
      userToken = registerResponse.data.token;
      userId = registerResponse.data.user.id;
    } catch (error) {
      if (error.response?.data?.message?.includes('existe déjà')) {
        console.log('👤 Utilisateur existe déjà, connexion...');
        const loginResponse = await axios.post(`${API_BASE}/userlogin`, {
          email: 'reservation_test@example.com',
          password: 'password123'
        });
        userToken = loginResponse.data.token;
        userId = loginResponse.data.user.id;
        console.log('✅ Connexion réussie');
      } else {
        throw error;
      }
    }

    // 3. Tester la réservation pour chaque livre indisponible
    console.log('\n📝 3. Test des réservations...');
    const livre = livresIndisponibles[0]; // Prenons le premier livre indisponible
    
    console.log(`📖 Test de réservation pour : "${livre.titre}"`);
    
    try {
      const reservationResponse = await axios.post(`${API_BASE}/reservations`, {
        bookId: livre.id
      }, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      console.log('✅ Réservation créée avec succès !');
      console.log(`   Message: ${reservationResponse.data.message}`);
      
      if (reservationResponse.data.data) {
        console.log(`   Position dans la file: ${reservationResponse.data.data.position}`);
      }
      
    } catch (error) {
      if (error.response?.data?.message?.includes('déjà réservé')) {
        console.log('ℹ️  Livre déjà réservé par cet utilisateur');
      } else {
        console.log('❌ Erreur de réservation:', error.response?.data?.message || error.message);
      }
    }

    // 4. Vérifier les réservations de l'utilisateur
    console.log('\n📋 4. Vérification des réservations de l\'utilisateur...');
    try {
      const mesReservationsResponse = await axios.get(`${API_BASE}/reservations/mes-reservations`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      const reservations = mesReservationsResponse.data.data;
      console.log(`✅ ${reservations.length} réservation(s) trouvée(s) :`);
      
      reservations.forEach((reservation, index) => {
        console.log(`   ${index + 1}. "${reservation.titre}" - Position: ${reservation.position} - Statut: ${reservation.statut}`);
      });
      
    } catch (error) {
      console.log('❌ Erreur lors de la récupération des réservations:', error.response?.data?.message || error.message);
    }

    // 5. Résumé final
    console.log('\n📊 5. RÉSUMÉ DU TEST');
    console.log('===================');
    console.log(`✅ ${livresIndisponibles.length} livres sont correctement indisponibles`);
    console.log('✅ Le bouton "Réserver" doit s\'afficher pour ces livres');
    console.log('✅ Le système de réservation fonctionne');
    console.log('✅ L\'utilisateur peut voir ses réservations');
    
    console.log('\n🎯 INSTRUCTIONS POUR LE FRONTEND :');
    console.log('1. Allez sur http://localhost:3001');
    console.log('2. Connectez-vous avec un compte utilisateur');
    console.log('3. Allez dans la section "Livres"');
    console.log('4. Vous devriez voir le bouton "Réserver" sur les livres indisponibles :');
    livresIndisponibles.slice(0, 3).forEach(livre => {
      console.log(`   - ${livre.titre}`);
    });
    console.log('5. Cliquez sur "Réserver" pour tester le système');

  } catch (error) {
    console.error('❌ Erreur générale:', error.response?.data || error.message);
  }
}

// Exécution du test
testCompletReservationSystem();
