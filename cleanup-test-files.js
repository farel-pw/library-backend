#!/usr/bin/env node

/**
 * Script de nettoyage des fichiers de test temporaires
 * Conserve uniquement les tests essentiels et archive les autres
 */

const fs = require('fs');
const path = require('path');

const TEST_FILES_TO_KEEP = [
  'test-connection.js',           // Test de base pour la connexion DB
  'test-exemplaires-system.js',  // Test principal du système d'exemplaires
  'test-api-exemplaires.js',     // Test API pour les exemplaires
  'test-emprunts.js',            // Test de base des emprunts
  'test-livres-api.js'           // Test de base des livres
];

const TEMP_TEST_FILES = [
  'test-analytics-model.js',
  'test-api-analytics.js',
  'test-api.js',
  'test-auth-issue.js',
  'test-books-api.js',
  'test-comments-api-full.js',
  'test-dashboard-queries.js',
  'test-db-connection.js',
  'test-db.js',
  'test-emprunts-calculs.js',
  'test-frontend-auth.js',
  'test-frontend-comment-problem.js',
  'test-frontend-fix.js',
  'test-frontend-interface.js',
  'test-frontend-livres.js',
  'test-frontend-scenario.js',
  'test-multiple-routes.js',
  'test-notifications-interactive.js',
  'test-notifications.js',
  'test-probleme-utilisateur.js',
  'test-reservation-notifications.js',
  'test-service.js'
];

const DEBUG_FILES = [
  'analyze-frontend-problem.js',
  'check-comments-table.js',
  'check-emprunts-columns.js',
  'check-table-structure.js',
  'check-users.js',
  'clean-test-comments.js',
  'debug-comment-issue.js',
  'diagnostic-complet.js',
  'fix-comments-table.js',
  'fix-emprunts-data.js',
  'fix-emprunts-dates.js',
  'guide-erreur-401.js',
  'guide-resolution.js',
  'restore-emprunts.js'
];

function createArchiveDirectory() {
  const archiveDir = path.join(__dirname, 'archived-tests');
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir);
    console.log('📁 Dossier d\'archive créé: archived-tests/');
  }
  return archiveDir;
}

function moveFilesToArchive(files, reason) {
  const archiveDir = createArchiveDirectory();
  let movedCount = 0;

  files.forEach(filename => {
    const sourcePath = path.join(__dirname, filename);
    const targetPath = path.join(archiveDir, filename);
    
    if (fs.existsSync(sourcePath)) {
      try {
        fs.renameSync(sourcePath, targetPath);
        console.log(`📦 Archivé: ${filename} (${reason})`);
        movedCount++;
      } catch (error) {
        console.error(`❌ Erreur lors de l'archivage de ${filename}:`, error.message);
      }
    }
  });

  return movedCount;
}

function cleanup() {
  console.log('🧹 Début du nettoyage des fichiers de test...\n');

  // Archiver les fichiers de test temporaires
  const tempMoved = moveFilesToArchive(TEMP_TEST_FILES, 'test temporaire');
  
  // Archiver les fichiers de debug
  const debugMoved = moveFilesToArchive(DEBUG_FILES, 'fichier de debug');

  console.log('\n📊 Résumé du nettoyage:');
  console.log(`├── Tests temporaires archivés: ${tempMoved}`);
  console.log(`├── Fichiers de debug archivés: ${debugMoved}`);
  console.log(`└── Total archivé: ${tempMoved + debugMoved} fichiers`);
  
  console.log('\n✅ Fichiers conservés pour les tests essentiels:');
  TEST_FILES_TO_KEEP.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
      console.log(`├── ${file}`);
    }
  });

  console.log('\n🎯 Nettoyage terminé! Le workspace est maintenant plus propre.');
  console.log('📁 Les fichiers archivés se trouvent dans: ./archived-tests/');
}

// Demander confirmation avant le nettoyage
if (process.argv.includes('--force')) {
  cleanup();
} else {
  console.log('🤔 Ce script va archiver les fichiers de test temporaires.');
  console.log('📁 Les fichiers seront déplacés vers ./archived-tests/');
  console.log('💡 Ajoutez --force pour exécuter sans confirmation.');
  console.log('\nFichiers qui seront archivés:');
  console.log('- Tests temporaires:', TEMP_TEST_FILES.length);
  console.log('- Fichiers de debug:', DEBUG_FILES.length);
  console.log('\nUtilisez: node cleanup-test-files.js --force');
}
