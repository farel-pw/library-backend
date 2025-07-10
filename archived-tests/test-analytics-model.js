require('dotenv').config();
const Analytics = require('./src/models/Analytics');

async function testAnalyticsModel() {
  try {
    console.log('🧪 Test du modèle Analytics...\n');
    
    console.log('📊 Appel de getDashboardStats...');
    const stats = await Analytics.getDashboardStats();
    
    console.log('\n✅ Résultats reçus:');
    console.log(JSON.stringify(stats, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAnalyticsModel();
