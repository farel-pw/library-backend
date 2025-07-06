const NotificationManagerService = require('../src/services/NotificationManagerService');

/**
 * Script de vérification automatique des emprunts en retard
 * Ce script peut être exécuté via un cron job pour vérifier
 * périodiquement les emprunts en retard et envoyer des notifications
 */

async function checkOverdueBooks() {
  console.log('🚀 Démarrage de la vérification des emprunts en retard...');
  console.log('📅 Heure:', new Date().toLocaleString('fr-FR'));
  
  try {
    const result = await NotificationManagerService.checkAndNotifyOverdueBooks();
    
    if (result.error) {
      console.error('❌ Erreur lors de la vérification:', result.message);
      process.exit(1);
    }
    
    console.log('✅ Vérification terminée avec succès');
    console.log(`📊 Résultats:
    - Emprunts en retard: ${result.overdueCount}
    - Notifications envoyées: ${result.notificationsSent}
    `);
    
    process.exit(0);
  } catch (error) {
    console.error('💥 Erreur inattendue:', error);
    process.exit(1);
  }
}

// Exécuter si le script est appelé directement
if (require.main === module) {
  checkOverdueBooks();
}

module.exports = { checkOverdueBooks };
