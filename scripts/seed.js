#!/usr/bin/env node

require('dotenv').config();
const MigrationManager = require('../database/MigrationManager');

async function main() {
  const manager = new MigrationManager();
  
  try {
    await manager.connect();
    await manager.runSeeders();
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error.message);
    process.exit(1);
  } finally {
    await manager.disconnect();
  }
}

main();
