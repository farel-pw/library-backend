const NotificationManagerService = require('./src/services/NotificationManagerService');

// Script utilitaire pour gérer les notifications
const args = process.argv.slice(2);
const command = args[0];

async function runCommand() {
  switch (command) {
    case 'check-overdue':
      console.log('🔍 Vérification des emprunts en retard...');
      const result = await NotificationManagerService.checkAndNotifyOverdueBooks();
      console.log(result);
      break;
      
    case 'stats':
      console.log('📊 Statistiques des notifications...');
      const stats = await NotificationManagerService.getNotificationStats();
      console.log(stats);
      break;
      
    case 'test-email':
      console.log('📧 Test de la configuration email...');
      const emailTest = await NotificationManagerService.testEmailConfiguration();
      console.log(emailTest);
      break;
      
    case 'help':
    default:
      console.log(`
📧 Gestionnaire de Notifications - Aide

Commandes disponibles:
  check-overdue   Vérifier et notifier les emprunts en retard
  stats          Afficher les statistiques des notifications
  test-email     Tester la configuration email
  help           Afficher cette aide

Exemples:
  node notification-manager.js check-overdue
  node notification-manager.js stats
  node notification-manager.js test-email

Configuration:
  Copiez .env.notifications.example vers .env et configurez vos paramètres SMTP
      `);
      break;
  }
  
  process.exit(0);
}

runCommand().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
