#!/usr/bin/env node

require('dotenv').config();

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🔧 Gestionnaire de Base de Données - Bibliothèque');
  console.log('================================================');
  console.log('');
  console.log('Options disponibles :');
  console.log('1. Migration seule (créer les tables)');
  console.log('2. Seeding seul (insérer les données de test)');
  console.log('3. Suppression complète (drop toutes les tables)');
  console.log('4. Base fraîche (drop + migration)');
  console.log('5. Installation complète (drop + migration + seeding)');
  console.log('6. Reset (équivalent à option 5)');
  console.log('0. Quitter');
  console.log('');

  const choice = await question('Choisissez une option (0-6) : ');

  try {
    switch (choice) {
      case '1':
        console.log('🚀 Exécution des migrations...');
        execSync('npm run db:migrate', { stdio: 'inherit' });
        break;
      
      case '2':
        console.log('🌱 Exécution du seeding...');
        execSync('npm run db:seed', { stdio: 'inherit' });
        break;
      
      case '3':
        const confirmDrop = await question('⚠️  Êtes-vous sûr de vouloir supprimer toutes les tables ? (oui/non) : ');
        if (confirmDrop.toLowerCase() === 'oui' || confirmDrop.toLowerCase() === 'yes') {
          console.log('🗑️  Suppression des tables...');
          execSync('npm run db:drop', { stdio: 'inherit' });
        } else {
          console.log('❌ Opération annulée');
        }
        break;
      
      case '4':
        console.log('🔄 Création d\'une base fraîche...');
        execSync('npm run db:fresh', { stdio: 'inherit' });
        break;
      
      case '5':
      case '6':
        console.log('🔄 Installation complète...');
        execSync('npm run db:migrate-seed', { stdio: 'inherit' });
        break;
      
      case '0':
        console.log('👋 Au revoir !');
        break;
      
      default:
        console.log('❌ Option invalide');
        break;
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution :', error.message);
    process.exit(1);
  }

  rl.close();
}

main();
