const NotificationManagerService = require('./src/services/NotificationManagerService');
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bibliotheque',
  port: parseInt(process.env.DB_PORT) || 3306
});

async function testReservationNotifications() {
  console.log('🧪 Test des notifications de réservations validées...\n');
  
  try {
    // Se connecter à la base
    await connection.promise().connect();
    console.log('✅ Connexion établie');
    
    // Récupérer les réservations en attente
    const [reservations] = await connection.promise().query(`
      SELECT 
        r.*,
        u.nom,
        u.prenom,
        u.email,
        l.titre,
        l.auteur
      FROM reservations r
      JOIN utilisateurs u ON r.utilisateur_id = u.id
      JOIN livres l ON r.livre_id = l.id
      WHERE r.statut = 'en_attente'
      LIMIT 2
    `);
    
    if (reservations.length === 0) {
      console.log('❌ Aucune réservation en attente trouvée');
      console.log('💡 Exécutez d\'abord: node create-test-reservations.js');
      return;
    }
    
    console.log(`📚 ${reservations.length} réservation(s) en attente trouvée(s):\n`);
    
    // Afficher les réservations
    reservations.forEach((res, index) => {
      console.log(`${index + 1}. ${res.titre} - ${res.prenom} ${res.nom} (${res.email})`);
    });
    
    console.log('\n🔄 Validation des réservations et envoi des notifications...\n');
    
    // Valider chaque réservation et envoyer les notifications
    for (let i = 0; i < reservations.length; i++) {
      const reservation = reservations[i];
      
      console.log(`📝 Validation de la réservation ${i + 1}: "${reservation.titre}"`);
      
      try {
        // Mettre à jour le statut en base
        await connection.promise().query(
          'UPDATE reservations SET statut = ? WHERE id = ?',
          ['validée', reservation.id]
        );
        
        // Envoyer la notification
        const notificationResult = await NotificationManagerService.notifyReservationApproved(
          reservation.id,
          reservation.utilisateur_id,
          reservation.livre_id
        );
        
        if (notificationResult.error) {
          console.log(`   ❌ Erreur notification: ${notificationResult.message}`);
        } else {
          console.log(`   ✅ Notification envoyée à ${reservation.email}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
      }
      
      // Petite pause entre les envois
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Vérifier les notifications créées
    console.log('\n📊 Vérification des notifications créées...');
    const stats = await NotificationManagerService.getNotificationStats();
    if (!stats.error) {
      console.log(`   📧 Total notifications: ${stats.data.total}`);
      console.log(`   ✉️ Emails envoyés: ${stats.data.emails_envoyes}`);
      console.log(`   👥 Utilisateurs notifiés: ${stats.data.utilisateurs_notifies}`);
    }
    
    console.log('\n🎉 Test terminé avec succès !');
    console.log('\n💡 Pour voir les notifications dans l\'interface utilisateur :');
    console.log('   - Connectez-vous avec un compte utilisateur');
    console.log('   - Vérifiez la section notifications');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    connection.end();
    process.exit(0);
  }
}

testReservationNotifications();
