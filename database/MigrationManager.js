const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

class MigrationManager {
  constructor() {
    this.connection = null;
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'bibliotheque',
      port: process.env.DB_PORT || 3306
    };
  }

  async connect() {
    try {
      // Se connecter sans base de données d'abord
      const tempConnection = await mysql.createConnection({
        ...this.config,
        database: undefined
      });

      // Créer la base de données si elle n'existe pas
      await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${this.config.database}\``);
      await tempConnection.end();

      // Se connecter à la base de données
      this.connection = await mysql.createConnection(this.config);
      console.log(`✅ Connecté à la base de données: ${this.config.database}`);
    } catch (error) {
      console.error('❌ Erreur de connexion à la base de données:', error.message);
      process.exit(1);
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('✅ Connexion fermée');
    }
  }

  async loadMigrations() {
    const migrationsDir = path.join(__dirname, './migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    return files.map(file => {
      const migrationPath = path.join(migrationsDir, file);
      return {
        name: file,
        module: require(migrationPath)
      };
    });
  }

  async loadSeeders() {
    const seedersDir = path.join(__dirname, './seeders');
    const files = fs.readdirSync(seedersDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    return files.map(file => {
      const seederPath = path.join(seedersDir, file);
      return {
        name: file,
        module: require(seederPath)
      };
    });
  }

  async runMigrations() {
    console.log('🚀 Début des migrations...');
    const migrations = await this.loadMigrations();

    for (const migration of migrations) {
      try {
        console.log(`📄 Exécution de la migration: ${migration.name}`);
        await migration.module.up(this.connection);
      } catch (error) {
        console.error(`❌ Erreur dans la migration ${migration.name}:`, error.message);
        throw error;
      }
    }

    console.log('✅ Toutes les migrations ont été exécutées avec succès !');
  }

  async rollbackMigrations() {
    console.log('🔄 Début du rollback des migrations...');
    const migrations = await this.loadMigrations();

    // Exécuter les rollbacks dans l'ordre inverse
    for (const migration of migrations.reverse()) {
      try {
        console.log(`📄 Rollback de la migration: ${migration.name}`);
        await migration.module.down(this.connection);
      } catch (error) {
        console.error(`❌ Erreur dans le rollback ${migration.name}:`, error.message);
        throw error;
      }
    }

    console.log('✅ Toutes les migrations ont été annulées avec succès !');
  }

  async runSeeders() {
    console.log('🌱 Début du seeding...');
    const seeders = await this.loadSeeders();

    for (const seeder of seeders) {
      try {
        console.log(`📄 Exécution du seeder: ${seeder.name}`);
        await seeder.module.up(this.connection);
      } catch (error) {
        console.error(`❌ Erreur dans le seeder ${seeder.name}:`, error.message);
        throw error;
      }
    }

    console.log('✅ Tous les seeders ont été exécutés avec succès !');
  }

  async rollbackSeeders() {
    console.log('🧹 Début du nettoyage des données...');
    const seeders = await this.loadSeeders();

    // Exécuter les rollbacks dans l'ordre inverse
    for (const seeder of seeders.reverse()) {
      try {
        console.log(`📄 Nettoyage du seeder: ${seeder.name}`);
        await seeder.module.down(this.connection);
      } catch (error) {
        console.error(`❌ Erreur dans le nettoyage ${seeder.name}:`, error.message);
        throw error;
      }
    }

    console.log('✅ Toutes les données ont été nettoyées avec succès !');
  }

  async reset() {
    console.log('🔄 Réinitialisation complète de la base de données...');
    await this.rollbackSeeders();
    await this.rollbackMigrations();
    console.log('✅ Base de données réinitialisée !');
  }

  async fresh() {
    console.log('🔄 Réinitialisation et migration complète...');
    await this.reset();
    await this.runMigrations();
    console.log('✅ Base de données fraîche prête !');
  }

  async freshSeed() {
    console.log('🔄 Réinitialisation, migration et seeding complets...');
    await this.reset();
    await this.runMigrations();
    await this.runSeeders();
    console.log('✅ Base de données complètement prête avec les données de test !');
  }
}

module.exports = MigrationManager;
