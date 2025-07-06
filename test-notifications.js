const NotificationManagerService = require('./src/services/NotificationManagerService');

async function testNotificationSystem() {
  console.log('🧪 Test du système de notifications...');
  
  try {
    // Test 1: Vérifier les emprunts en retard
    console.log('\n📚 Test 1: Vérification des emprunts en retard');
    const result = await NotificationManagerService.checkAndNotifyOverdueBooks();
    console.log('Résultat:', result);
    
    // Test 2: Statistiques des notifications
    console.log('\n📊 Test 2: Statistiques des notifications');
    const stats = await NotificationManagerService.getNotificationStats();
    console.log('Statistiques:', stats);
    
    // Test 3: Test de configuration email (optionnel)
    console.log('\n📧 Test 3: Configuration email');
    const emailTest = await NotificationManagerService.testEmailConfiguration();
    console.log('Test email:', emailTest);
    
    console.log('\n✅ Tests terminés');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
  
  process.exit(0);
}

testNotificationSystem();
