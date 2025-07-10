require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixCommentsTable() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'bibliotheque',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connexion à la base de données réussie');

    // Vérifier la structure actuelle
    console.log('\n📊 Structure actuelle de la table commentaires:');
    const [columns] = await connection.execute('SHOW COLUMNS FROM commentaires');
    columns.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.Field} (${col.Type})`);
    });

    // Vérifier si la colonne date_commentaire existe
    const dateCommentaireExists = columns.some(col => col.Field === 'date_commentaire');
    const datePublicationExists = columns.some(col => col.Field === 'date_publication');

    if (!dateCommentaireExists && datePublicationExists) {
      console.log('\n🔧 Renommage de la colonne date_publication en date_commentaire...');
      await connection.execute('ALTER TABLE commentaires CHANGE date_publication date_commentaire DATETIME DEFAULT CURRENT_TIMESTAMP');
      console.log('✅ Colonne renommée avec succès');
    }

    // Vérifier si la colonne commentaire est nullable (elle ne devrait pas l'être)
    const commentaireColumn = columns.find(col => col.Field === 'commentaire');
    if (commentaireColumn && commentaireColumn.Null === 'YES') {
      console.log('\n🔧 Modification de la colonne commentaire pour qu\'elle ne soit pas nullable...');
      await connection.execute('ALTER TABLE commentaires MODIFY commentaire TEXT NOT NULL');
      console.log('✅ Colonne modifiée avec succès');
    }

    // Vérifier la structure finale
    console.log('\n📊 Structure finale de la table commentaires:');
    const [finalColumns] = await connection.execute('SHOW COLUMNS FROM commentaires');
    finalColumns.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'Nullable' : 'Not Null'}`);
    });

    // Compter les commentaires
    const [count] = await connection.execute('SELECT COUNT(*) as count FROM commentaires');
    console.log(`\n📊 Nombre total de commentaires: ${count[0].count}`);

    // Afficher quelques commentaires
    const [comments] = await connection.execute('SELECT * FROM commentaires ORDER BY date_commentaire DESC LIMIT 3');
    console.log('\n📝 Derniers commentaires:');
    comments.forEach((comment, index) => {
      console.log(`   ${index + 1}. Utilisateur ${comment.utilisateur_id} - Livre ${comment.livre_id} - Note: ${comment.note}`);
      console.log(`      "${comment.commentaire.substring(0, 50)}..."`);
    });

    console.log('\n✅ Table commentaires vérifiée et corrigée');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixCommentsTable();
