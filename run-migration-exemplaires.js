require('dotenv').config();
const connection = require('./src/config/database');

async function runMigration() {
  try {
    console.log('🔄 Démarrage de la migration...');

    // 1. Ajouter les colonnes pour gérer les exemplaires
    console.log('📝 Ajout des colonnes exemplaires...');
    
    try {
      await new Promise((resolve, reject) => {
        connection.query(`
          ALTER TABLE livres 
          ADD COLUMN exemplaires_total INT DEFAULT 3 COMMENT 'Nombre total d\\'exemplaires disponibles'
        `, (err, result) => {
          if (err && err.code !== 'ER_DUP_FIELDNAME') reject(err);
          else resolve(result);
        });
      });
      console.log('✅ Colonne exemplaires_total ajoutée');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Colonne exemplaires_total déjà existante');
      } else {
        throw err;
      }
    }

    try {
      await new Promise((resolve, reject) => {
        connection.query(`
          ALTER TABLE livres 
          ADD COLUMN exemplaires_disponibles INT DEFAULT 3 COMMENT 'Nombre d\\'exemplaires actuellement disponibles'
        `, (err, result) => {
          if (err && err.code !== 'ER_DUP_FIELDNAME') reject(err);
          else resolve(result);
        });
      });
      console.log('✅ Colonne exemplaires_disponibles ajoutée');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Colonne exemplaires_disponibles déjà existante');
      } else {
        throw err;
      }
    }

    // 2. Mettre à jour les livres existants
    console.log('🔄 Mise à jour des livres existants...');
    const updateResult = await new Promise((resolve, reject) => {
      connection.query(`
        UPDATE livres SET 
          exemplaires_total = 3,
          exemplaires_disponibles = CASE 
            WHEN disponible = 1 THEN 3 
            ELSE 0 
          END
        WHERE exemplaires_total IS NULL OR exemplaires_disponibles IS NULL
      `, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    console.log(`✅ ${updateResult.affectedRows} livres mis à jour`);

    // 3. Ajouter des colonnes supplémentaires aux emprunts
    console.log('📝 Ajout des colonnes emprunts...');
    
    try {
      await new Promise((resolve, reject) => {
        connection.query(`
          ALTER TABLE emprunts 
          ADD COLUMN penalites DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Montant des pénalités de retard'
        `, (err, result) => {
          if (err && err.code !== 'ER_DUP_FIELDNAME') reject(err);
          else resolve(result);
        });
      });
      console.log('✅ Colonne penalites ajoutée');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Colonne penalites déjà existante');
      } else {
        throw err;
      }
    }

    try {
      await new Promise((resolve, reject) => {
        connection.query(`
          ALTER TABLE emprunts 
          ADD COLUMN notes_admin TEXT COMMENT 'Notes administratives sur l\\'emprunt'
        `, (err, result) => {
          if (err && err.code !== 'ER_DUP_FIELDNAME') reject(err);
          else resolve(result);
        });
      });
      console.log('✅ Colonne notes_admin ajoutée');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Colonne notes_admin déjà existante');
      } else {
        throw err;
      }
    }

    // 4. Créer les index pour optimiser les requêtes
    console.log('📊 Création des index...');
    
    const indexes = [
      { name: 'idx_livres_disponibles', sql: 'CREATE INDEX idx_livres_disponibles ON livres(exemplaires_disponibles)' },
      { name: 'idx_emprunts_retour', sql: 'CREATE INDEX idx_emprunts_retour ON emprunts(date_retour_effective)' },
      { name: 'idx_emprunts_livre_actifs', sql: 'CREATE INDEX idx_emprunts_livre_actifs ON emprunts(livre_id, date_retour_effective)' }
    ];

    for (const index of indexes) {
      try {
        await new Promise((resolve, reject) => {
          connection.query(index.sql, (err, result) => {
            if (err && err.code !== 'ER_DUP_KEYNAME') reject(err);
            else resolve(result);
          });
        });
        console.log(`✅ Index ${index.name} créé`);
      } catch (err) {
        if (err.code === 'ER_DUP_KEYNAME') {
          console.log(`⚠️  Index ${index.name} déjà existant`);
        } else {
          throw err;
        }
      }
    }

    // 5. Corriger la disponibilité basée sur les emprunts actifs
    console.log('🔄 Correction de la disponibilité basée sur les emprunts...');
    await new Promise((resolve, reject) => {
      connection.query(`
        UPDATE livres l 
        SET exemplaires_disponibles = GREATEST(0, 3 - (
          SELECT COUNT(*) 
          FROM emprunts e 
          WHERE e.livre_id = l.id 
          AND e.date_retour_effective IS NULL
        ))
      `, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    console.log('✅ Disponibilité corrigée');

    // 6. Afficher un résumé
    const livres = await new Promise((resolve, reject) => {
      connection.query(`
        SELECT 
          COUNT(*) as total_livres,
          SUM(exemplaires_total) as total_exemplaires,
          SUM(exemplaires_disponibles) as exemplaires_disponibles,
          COUNT(CASE WHEN exemplaires_disponibles > 0 THEN 1 END) as livres_disponibles
        FROM livres
      `, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    console.log('\n📊 Résumé de la migration:');
    console.log(`   📚 Total livres: ${livres[0].total_livres}`);
    console.log(`   📖 Total exemplaires: ${livres[0].total_exemplaires}`);
    console.log(`   ✅ Exemplaires disponibles: ${livres[0].exemplaires_disponibles}`);
    console.log(`   📗 Livres avec exemplaires disponibles: ${livres[0].livres_disponibles}`);

    console.log('\n🎉 Migration terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    connection.end();
  }
}

runMigration();
