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

async function displayMenu() {
  console.log('\n🔔 === TESTEUR DE NOTIFICATIONS === \n');
  console.log('1. 📚 Créer des réservations de test');
  console.log('2. ✅ Valider des réservations (avec notifications)');
  console.log('3. ⏰ Créer des emprunts en retard');
  console.log('4. 🚨 Vérifier les emprunts en retard (avec notifications)');
  console.log('5. 📊 Voir les statistiques des notifications');
  console.log('6. 📧 Tester la configuration email');
  console.log('7. 📝 Voir toutes les notifications en base');
  console.log('8. 🗑️ Nettoyer toutes les notifications');
  console.log('0. ❌ Quitter\n');
}

async function createTestReservations() {
  console.log('\n📚 Création de réservations de test...');
  
  try {
    // Vider les réservations existantes
    await connection.promise().query('DELETE FROM reservations');
    
    const today = new Date();
    const reservations = [
      { utilisateur_id: 2, livre_id: 7, jours_ago: 1 },
      { utilisateur_id: 3, livre_id: 8, jours_ago: 2 },
      { utilisateur_id: 4, livre_id: 9, jours_ago: 3 }
    ];
    
    for (const res of reservations) {
      const dateReservation = new Date(today.getTime() - res.jours_ago * 24 * 60 * 60 * 1000);
      await connection.promise().query(
        'INSERT INTO reservations (utilisateur_id, livre_id, date_reservation, statut) VALUES (?, ?, ?, ?)',
        [res.utilisateur_id, res.livre_id, dateReservation.toISOString().slice(0, 19).replace('T', ' '), 'en_attente']
      );
    }
    
    console.log(`✅ ${reservations.length} réservations créées en attente`);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function validateReservations() {
  console.log('\n✅ Validation de réservations...');
  
  try {
    const [reservations] = await connection.promise().query(`
      SELECT r.*, u.email, l.titre 
      FROM reservations r
      JOIN utilisateurs u ON r.utilisateur_id = u.id
      JOIN livres l ON r.livre_id = l.id
      WHERE r.statut = 'en_attente'
      LIMIT 2
    `);
    
    if (reservations.length === 0) {
      console.log('❌ Aucune réservation en attente');
      return;
    }
    
    for (const res of reservations) {
      console.log(`📝 Validation: "${res.titre}" pour ${res.email}`);
      
      // Valider la réservation
      await connection.promise().query(
        'UPDATE reservations SET statut = ? WHERE id = ?',
        ['validée', res.id]
      );
      
      // Envoyer notification
      const result = await NotificationManagerService.notifyReservationApproved(
        res.id, res.utilisateur_id, res.livre_id
      );
      
      if (result.error) {
        console.log(`   ❌ ${result.message}`);
      } else {
        console.log(`   ✅ Notification envoyée`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function createOverdueBooks() {
  console.log('\n⏰ Création d\'emprunts en retard...');
  
  try {
    // Vider les emprunts existants
    await connection.promise().query('DELETE FROM emprunts');
    
    const today = new Date();
    const emprunts = [
      { utilisateur_id: 2, livre_id: 1, jours_retard: 3 },
      { utilisateur_id: 3, livre_id: 2, jours_retard: 7 },
      { utilisateur_id: 4, livre_id: 3, jours_retard: 1 }
    ];
    
    for (const emp of emprunts) {
      const dateEmprunt = new Date(today.getTime() - (14 + emp.jours_retard) * 24 * 60 * 60 * 1000);
      const dateRetourPrevue = new Date(today.getTime() - emp.jours_retard * 24 * 60 * 60 * 1000);
      
      await connection.promise().query(
        'INSERT INTO emprunts (utilisateur_id, livre_id, date_emprunt, date_retour_prevue, rendu) VALUES (?, ?, ?, ?, ?)',
        [emp.utilisateur_id, emp.livre_id, 
         dateEmprunt.toISOString().slice(0, 19).replace('T', ' '),
         dateRetourPrevue.toISOString().slice(0, 19).replace('T', ' '),
         false]
      );
    }
    
    console.log(`✅ ${emprunts.length} emprunts en retard créés`);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function checkOverdueBooks() {
  console.log('\n🚨 Vérification des emprunts en retard...');
  
  try {
    const result = await NotificationManagerService.checkAndNotifyOverdueBooks();
    
    if (result.error) {
      console.log(`❌ ${result.message}`);
    } else {
      console.log(`✅ Vérification terminée`);
      console.log(`📊 Emprunts en retard: ${result.overdueCount}`);
      console.log(`📧 Notifications envoyées: ${result.notificationsSent}`);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function showStats() {
  console.log('\n📊 Statistiques des notifications...');
  
  try {
    const result = await NotificationManagerService.getNotificationStats();
    
    if (result.error) {
      console.log(`❌ ${result.message}`);
    } else {
      const stats = result.data;
      console.log(`📧 Total notifications: ${stats.total}`);
      console.log(`📬 Non lues: ${stats.non_lues || 0}`);
      console.log(`✉️ Emails envoyés: ${stats.emails_envoyes || 0}`);
      console.log(`👥 Utilisateurs notifiés: ${stats.utilisateurs_notifies}`);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function testEmail() {
  console.log('\n📧 Test de la configuration email...');
  
  try {
    const result = await NotificationManagerService.testEmailConfiguration();
    
    if (result.error) {
      console.log(`❌ ${result.message}`);
      console.log('💡 Configurez vos paramètres SMTP dans .env');
    } else {
      console.log(`✅ Email de test envoyé`);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function showAllNotifications() {
  console.log('\n📝 Toutes les notifications...');
  
  try {
    const [notifications] = await connection.promise().query(`
      SELECT 
        n.*, 
        u.nom, 
        u.prenom, 
        u.email 
      FROM notifications n
      JOIN utilisateurs u ON n.utilisateur_id = u.id
      ORDER BY n.created_at DESC
      LIMIT 10
    `);
    
    if (notifications.length === 0) {
      console.log('📭 Aucune notification trouvée');
      return;
    }
    
    notifications.forEach((notif, index) => {
      const status = notif.lu ? '✅' : '📬';
      const email = notif.email_sent ? '📧' : '⚪';
      console.log(`${index + 1}. ${status} ${email} [${notif.type}] ${notif.titre}`);
      console.log(`    👤 ${notif.prenom} ${notif.nom} (${notif.email})`);
      console.log(`    📅 ${new Date(notif.created_at).toLocaleString('fr-FR')}\n`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function cleanNotifications() {
  console.log('\n🗑️ Nettoyage des notifications...');
  
  try {
    await connection.promise().query('DELETE FROM notifications');
    console.log('✅ Toutes les notifications supprimées');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function runInteractiveTest() {
  try {
    await connection.promise().connect();
    console.log('✅ Connexion à la base établie');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const askQuestion = (question) => {
      return new Promise(resolve => rl.question(question, resolve));
    };
    
    while (true) {
      await displayMenu();
      const choice = await askQuestion('Choisissez une option (0-8): ');
      
      switch (choice) {
        case '1':
          await createTestReservations();
          break;
        case '2':
          await validateReservations();
          break;
        case '3':
          await createOverdueBooks();
          break;
        case '4':
          await checkOverdueBooks();
          break;
        case '5':
          await showStats();
          break;
        case '6':
          await testEmail();
          break;
        case '7':
          await showAllNotifications();
          break;
        case '8':
          await cleanNotifications();
          break;
        case '0':
          console.log('👋 Au revoir !');
          rl.close();
          return;
        default:
          console.log('❌ Option invalide');
      }
      
      await askQuestion('\nAppuyez sur Entrée pour continuer...');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    connection.end();
    process.exit(0);
  }
}

runInteractiveTest();
