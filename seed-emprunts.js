require('dotenv').config();
const MigrationManager = require('./database/MigrationManager');

async function seedEmprunts() {
  const manager = new MigrationManager();
  
  try {
    await manager.connect();
    
    // Charger et exécuter seulement le seeder des emprunts
    const seeder = require('./database/seeders/002_realistic_emprunts.js');
    console.log('🌱 Exécution du seeder des emprunts...');
    await seeder.up(manager.connection);
    console.log('✅ Seeder des emprunts terminé !');
    
  } catch (error) {
    console.error('❌ Erreur lors du seeding des emprunts:', error.message);
  } finally {
    await manager.disconnect();
  }
}

seedEmprunts();
