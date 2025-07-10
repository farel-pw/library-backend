#!/usr/bin/env node

/**
 * Script pour mettre à jour les statuts des emprunts et tester le nouveau système
 */

require('dotenv').config();
const connection = require('./src/config/database');

async function updateBorrowStatuses() {
  console.log('🔄 Mise à jour des statuts des emprunts...\n');

  try {
    // 1. Mettre à jour les statuts des emprunts retournés
    const updateReturnedQuery = `
      UPDATE emprunts 
      SET statut = 'retourne' 
      WHERE date_retour_effective IS NOT NULL 
      AND (statut != 'retourne' OR statut IS NULL)
    `;

    const returnedResult = await new Promise((resolve, reject) => {
      connection.query(updateReturnedQuery, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    console.log(`✅ ${returnedResult.affectedRows} emprunts marqués comme 'retourne'`);

    // 2. Mettre à jour les statuts des emprunts en cours
    const updateActiveQuery = `
      UPDATE emprunts 
      SET statut = 'en_cours' 
      WHERE date_retour_effective IS NULL 
      AND (statut != 'en_cours' OR statut IS NULL)
    `;

    const activeResult = await new Promise((resolve, reject) => {
      connection.query(updateActiveQuery, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    console.log(`✅ ${activeResult.affectedRows} emprunts marqués comme 'en_cours'`);

    // 3. Afficher un résumé des statuts
    const statsQuery = `
      SELECT 
        statut,
        COUNT(*) as count
      FROM emprunts 
      GROUP BY statut
      ORDER BY statut
    `;

    const stats = await new Promise((resolve, reject) => {
      connection.query(statsQuery, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log('\n📊 Résumé des statuts des emprunts:');
    stats.forEach(stat => {
      const statut = stat.statut || 'null';
      const icon = statut === 'en_cours' ? '🔄' : statut === 'retourne' ? '✅' : '❓';
      console.log(`   ${icon} ${statut}: ${stat.count} emprunts`);
    });

    // 4. Tester le système de disponibilité
    console.log('\n📚 Test du système de disponibilité:');
    
    const availabilityQuery = `
      SELECT 
        l.id,
        l.titre,
        3 as exemplaires_total,
        COALESCE(emprunts_actifs.count, 0) as emprunts_actifs,
        COALESCE(emprunts_retournes.count, 0) as emprunts_retournes,
        GREATEST(0, 3 - COALESCE(emprunts_actifs.count, 0)) as exemplaires_disponibles,
        CASE 
          WHEN GREATEST(0, 3 - COALESCE(emprunts_actifs.count, 0)) > 0 THEN 'disponible'
          ELSE 'reservable' 
        END as statut
      FROM livres l
      LEFT JOIN (
        SELECT 
          livre_id, 
          COUNT(*) as count 
        FROM emprunts 
        WHERE statut = 'en_cours'
        GROUP BY livre_id
      ) emprunts_actifs ON l.id = emprunts_actifs.livre_id
      LEFT JOIN (
        SELECT 
          livre_id, 
          COUNT(*) as count 
        FROM emprunts 
        WHERE statut = 'retourne'
        GROUP BY livre_id
      ) emprunts_retournes ON l.id = emprunts_retournes.livre_id
      ORDER BY l.titre
      LIMIT 5
    `;

    const availability = await new Promise((resolve, reject) => {
      connection.query(availabilityQuery, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    availability.forEach(livre => {
      const icon = livre.statut === 'disponible' ? '🟢' : '🔴';
      console.log(`   ${icon} "${livre.titre}"`);
      console.log(`      📖 Disponibles: ${livre.exemplaires_disponibles}/3`);
      console.log(`      🔄 En cours: ${livre.emprunts_actifs}`);
      console.log(`      ✅ Retournés: ${livre.emprunts_retournes}`);
      console.log(`      🎯 Statut: ${livre.statut}\n`);
    });

    console.log('🎉 Mise à jour terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    connection.end();
  }
}

// Exécuter le script
updateBorrowStatuses();
