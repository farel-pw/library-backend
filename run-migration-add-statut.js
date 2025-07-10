#!/usr/bin/env node

/**
 * Script pour exécuter la migration de la colonne statut
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const connection = require('./src/config/database');

async function runMigration() {
  console.log('🔄 Exécution de la migration pour ajouter la colonne statut...\n');

  try {
    // Lire le fichier SQL de migration
    const migrationPath = path.join(__dirname, 'migration_add_statut_column.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Séparer les commandes SQL
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd && !cmd.startsWith('--'));

    console.log(`📄 ${commands.length} commandes SQL à exécuter...\n`);

    // Exécuter chaque commande
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command) {
        console.log(`⚡ Exécution de la commande ${i + 1}/${commands.length}...`);
        
        await new Promise((resolve, reject) => {
          connection.query(command, (err, result) => {
            if (err) {
              console.error(`❌ Erreur dans la commande ${i + 1}:`, err.message);
              reject(err);
            } else {
              console.log(`✅ Commande ${i + 1} exécutée avec succès`);
              if (result && result.message) {
                console.log(`   Message: ${result.message}`);
              }
              resolve(result);
            }
          });
        });
      }
    }

    // Vérifier la nouvelle structure
    console.log('\n📊 Vérification de la nouvelle structure...');
    
    const structure = await new Promise((resolve, reject) => {
      connection.query('DESCRIBE emprunts', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log('\n📋 Structure mise à jour de la table emprunts:');
    structure.forEach(row => {
      const icon = row.Field === 'statut' ? '🆕' : '  ';
      console.log(`${icon} ${row.Field}: ${row.Type} ${row.Null === 'YES' ? '(nullable)' : '(not null)'} ${row.Default ? `[${row.Default}]` : ''}`);
    });

    // Afficher les statistiques des statuts
    const stats = await new Promise((resolve, reject) => {
      connection.query('SELECT statut, COUNT(*) as count FROM emprunts GROUP BY statut', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log('\n📈 Statistiques des statuts:');
    stats.forEach(stat => {
      const icon = stat.statut === 'en_cours' ? '🔄' : stat.statut === 'retourne' ? '✅' : '❓';
      console.log(`   ${icon} ${stat.statut}: ${stat.count} emprunts`);
    });

    console.log('\n🎉 Migration terminée avec succès!');

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    connection.end();
  }
}

// Exécuter la migration
runMigration();
