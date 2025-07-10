#!/usr/bin/env node

require('dotenv').config();
const connection = require('./src/config/database');

console.log('🔄 Migration simple...');

// Ajouter la colonne statut
connection.query('ALTER TABLE emprunts ADD COLUMN statut VARCHAR(20) DEFAULT "en_cours" AFTER date_retour_effective', (err, result) => {
  if (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('✅ La colonne statut existe déjà');
    } else {
      console.error('❌ Erreur:', err.message);
      connection.end();
      return;
    }
  } else {
    console.log('✅ Colonne statut ajoutée');
  }

  // Mettre à jour les statuts
  connection.query('UPDATE emprunts SET statut = CASE WHEN date_retour_effective IS NOT NULL THEN "retourne" WHEN rendu = 1 THEN "retourne" ELSE "en_cours" END', (err, result) => {
    if (err) {
      console.error('❌ Erreur update:', err.message);
    } else {
      console.log('✅ Statuts mis à jour:', result.affectedRows, 'lignes');
    }
    
    // Vérifier les statuts
    connection.query('SELECT statut, COUNT(*) as count FROM emprunts GROUP BY statut', (err, rows) => {
      if (err) {
        console.error('❌ Erreur stats:', err.message);
      } else {
        console.log('📊 Statistiques:');
        rows.forEach(row => {
          console.log(`   ${row.statut}: ${row.count} emprunts`);
        });
      }
      
      console.log('🎉 Migration terminée!');
      connection.end();
    });
  });
});
