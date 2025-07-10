const mysql = require('mysql2/promise');

async function addStatusColumnToComments() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'bibliotheque'
    });

    console.log('📝 Ajout de la colonne statut à la table commentaires...');

    // Ajouter la colonne statut
    await connection.execute(`
      ALTER TABLE commentaires 
      ADD COLUMN statut ENUM('en_attente', 'approuve', 'rejete') DEFAULT 'en_attente'
    `);

    console.log('✅ Colonne statut ajoutée');

    // Ajouter d'autres colonnes utiles pour la modération
    try {
      await connection.execute(`
        ALTER TABLE commentaires 
        ADD COLUMN date_moderation TIMESTAMP NULL,
        ADD COLUMN notes_moderation TEXT NULL
      `);
      console.log('✅ Colonnes de modération ajoutées');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Erreur ajout colonnes modération:', error.message);
      } else {
        console.log('ℹ️  Colonnes de modération déjà existantes');
      }
    }

    // Mettre à jour tous les commentaires existants avec le statut par défaut
    const [result] = await connection.execute(`
      UPDATE commentaires 
      SET statut = 'en_attente' 
      WHERE statut IS NULL
    `);

    console.log(`✅ ${result.affectedRows} commentaires mis à jour avec le statut par défaut`);

    // Vérifier la nouvelle structure
    const [columns] = await connection.execute("DESCRIBE commentaires");
    console.log('\n📋 Nouvelle structure de la table commentaires :');
    columns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    await connection.end();
    console.log('\n🎉 Correction de la table commentaires terminée !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

addStatusColumnToComments();
