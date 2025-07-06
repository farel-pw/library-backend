const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bibliotheque',
  port: parseInt(process.env.DB_PORT) || 3306
});

connection.connect(function(err) {
  if (err) {
    console.error('❌ Erreur de connexion:', err.message);
    process.exit(1);
  }
  
  console.log('✅ Connexion réussie');
  
  // Vider la table reservations d'abord
  connection.query('DELETE FROM reservations', (err) => {
    if (err) {
      console.error('Erreur suppression réservations:', err.message);
      return;
    }
    
    console.log('🗑️ Table réservations vidée');
    
    // Créer des réservations avec différents statuts
    const today = new Date();
    const reservations = [
      {
        utilisateur_id: 2,
        livre_id: 7,
        date_reservation: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // Il y a 3 jours
        statut: 'en_attente'
      },
      {
        utilisateur_id: 3,
        livre_id: 8,
        date_reservation: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // Il y a 5 jours
        statut: 'en_attente'
      },
      {
        utilisateur_id: 4,
        livre_id: 9,
        date_reservation: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // Il y a 2 jours
        statut: 'en_attente'
      },
      {
        utilisateur_id: 5,
        livre_id: 10,
        date_reservation: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), // Il y a 1 jour
        statut: 'en_attente'
      }
    ];
    
    let reservationsCreated = 0;
    
    reservations.forEach((reservation, index) => {
      const query = `INSERT INTO reservations (utilisateur_id, livre_id, date_reservation, statut) VALUES (?, ?, ?, ?)`;
      const values = [
        reservation.utilisateur_id,
        reservation.livre_id,
        reservation.date_reservation.toISOString().slice(0, 19).replace('T', ' '),
        reservation.statut
      ];
      
      connection.query(query, values, (err, result) => {
        if (err) {
          console.error(`❌ Erreur réservation ${index + 1}:`, err.message);
        } else {
          console.log(`✅ Réservation ${index + 1} créée (ID: ${result.insertId})`);
          reservationsCreated++;
        }
        
        // Une fois toutes les réservations créées, on peut les valider
        if (index === reservations.length - 1) {
          setTimeout(() => {
            console.log(`\n📊 ${reservationsCreated} réservations créées en attente`);
            console.log('🎯 Prêt pour tester les validations de réservations !');
            
            console.log('\n📋 Pour tester les notifications de réservations validées :');
            console.log('1. Démarrez votre serveur backend');
            console.log('2. Utilisez l\'interface admin pour valider les réservations');
            console.log('3. Ou utilisez le script de test : node test-reservation-notifications.js');
            
            connection.end();
          }, 1000);
        }
      });
    });
  });
});
