/**
 * Script de diagnostic du système de réservation
 * Identifie et résout les problèmes de réservation
 */

const axios = require('axios');

const API_BASE = 'http://localhost:4401';

async function diagnostiqueReservation() {
  console.log('🔍 DIAGNOSTIC DU SYSTÈME DE RÉSERVATION');
  console.log('==========================================\n');

  try {
    // 1. Test de connexion
    console.log('1️⃣ Test de connexion...');
    const loginResponse = await axios.post(`${API_BASE}/userlogin`, {
      email: 'test@bibliotheque.com',
      password: 'test123'
    });
    
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    console.log(`✅ Connexion réussie - Utilisateur ID: ${userId}`);

    // 2. Vérification des livres indisponibles
    console.log('\n2️⃣ Vérification des livres indisponibles...');
    const livresResponse = await axios.get(`${API_BASE}/livres`);
    const livres = livresResponse.data.data;
    
    const livresIndisponibles = livres.filter(livre => !livre.disponible);
    console.log(`✅ ${livresIndisponibles.length} livres indisponibles trouvés`);
    
    if (livresIndisponibles.length > 0) {
      const livre = livresIndisponibles[0];
      console.log(`📖 Livre test: "${livre.titre}" (ID: ${livre.id})`);
      console.log(`   - Disponibles: ${livre.exemplaires_disponibles}/${livre.exemplaires_total}`);
      console.log(`   - Peut réserver: ${livre.peut_reserver}`);

      // 3. Test de réservation
      console.log('\n3️⃣ Test de réservation...');
      
      try {
        const reservationResponse = await axios.post(`${API_BASE}/reservations`, {
          livre_id: livre.id
        }, {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 10000
        });
        
        console.log('✅ Réservation créée avec succès !');
        console.log(`   Message: ${reservationResponse.data.message}`);
        
      } catch (reservationError) {
        console.log('❌ Erreur lors de la réservation:');
        
        if (reservationError.response) {
          console.log(`   Status: ${reservationError.response.status}`);
          console.log(`   Message: ${reservationError.response.data.message || reservationError.response.data}`);
        } else if (reservationError.code === 'ECONNABORTED') {
          console.log('   Timeout - La requête a pris trop de temps');
        } else {
          console.log(`   Erreur: ${reservationError.message}`);
        }
      }

      // 4. Vérification des réservations existantes
      console.log('\n4️⃣ Vérification des réservations existantes...');
      try {
        const mesReservationsResponse = await axios.get(`${API_BASE}/reservations`, {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 5000
        });
        
        const reservations = mesReservationsResponse.data.data;
        console.log(`✅ ${reservations.length} réservation(s) trouvée(s)`);
        
        reservations.forEach((res, index) => {
          console.log(`   ${index + 1}. "${res.titre}" - Statut: ${res.statut}`);
        });
        
      } catch (listError) {
        console.log('❌ Erreur lors de la récupération des réservations:');
        console.log(`   ${listError.response?.data?.message || listError.message}`);
      }
    }

    // 5. Test direct de la base de données
    console.log('\n5️⃣ Test direct de la base de données...');
    const mysql = require('mysql2/promise');
    
    try {
      const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'bibliotheque'
      });
      
      // Vérifier la table reservations
      const [tables] = await connection.execute("SHOW TABLES LIKE 'reservations'");
      if (tables.length === 0) {
        console.log('❌ Table "reservations" n\'existe pas');
      } else {
        console.log('✅ Table "reservations" existe');
        
        // Vérifier la structure
        const [columns] = await connection.execute("DESCRIBE reservations");
        console.log('   Colonnes:');
        columns.forEach(col => {
          console.log(`     - ${col.Field} (${col.Type})`);
        });
        
        // Compter les réservations
        const [count] = await connection.execute("SELECT COUNT(*) as total FROM reservations");
        console.log(`   Total réservations: ${count[0].total}`);
      }
      
      await connection.end();
      
    } catch (dbError) {
      console.log(`❌ Erreur base de données: ${dbError.message}`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécution du diagnostic
diagnostiqueReservation();
