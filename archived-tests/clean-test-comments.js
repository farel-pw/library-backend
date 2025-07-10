const mysql = require('mysql2');
const connection = require('./src/config/database');

async function cleanTestComments() {
  try {
    console.log('🔗 Connexion à la base de données MySQL...');

    // Lister tous les commentaires avant nettoyage
    const getAllCommentsQuery = `
      SELECT c.*, u.nom as utilisateur_nom, u.prenom as utilisateur_prenom 
      FROM commentaires c
      LEFT JOIN utilisateurs u ON c.utilisateur_id = u.id
      ORDER BY c.date_commentaire DESC
    `;

    connection.query(getAllCommentsQuery, (err, allComments) => {
      if (err) {
        console.error('❌ Erreur lors de la récupération des commentaires:', err);
        return;
      }

      console.log(`📊 Nombre total de commentaires avant nettoyage: ${allComments.length}`);

      if (allComments.length > 0) {
        console.log('\n📋 Commentaires existants:');
        allComments.forEach(comment => {
          const nom = comment.utilisateur_nom || 'Utilisateur inconnu';
          const prenom = comment.utilisateur_prenom || '';
          console.log(`- ID: ${comment.id}, Livre: ${comment.livre_id}, User: ${comment.utilisateur_id} (${nom} ${prenom}), Commentaire: "${comment.commentaire.substring(0, 50)}..."`);
        });
      }

      // Chercher les commentaires de test
      const getTestCommentsQuery = `
        SELECT * FROM commentaires 
        WHERE commentaire LIKE '%test%' 
           OR commentaire LIKE '%Test%' 
           OR commentaire LIKE '%TEST%'
           OR commentaire LIKE '%debug%'
           OR commentaire LIKE '%Debug%'
           OR commentaire LIKE '%temporaire%'
           OR commentaire LIKE '%temp%'
           OR commentaire LIKE '%script%'
           OR commentaire LIKE '%automatique%'
           OR commentaire = 'Commentaire de test'
           OR commentaire = 'Test commentaire'
           OR commentaire = 'Commentaire test'
           OR commentaire = 'Test de commentaire'
           OR commentaire = 'Commentaire vide'
           OR commentaire = 'Commentaire invalide'
           OR commentaire = 'Commentaire créé par script'
           OR commentaire = 'Commentaire automatique'
        ORDER BY date_commentaire DESC
      `;

      connection.query(getTestCommentsQuery, (err, testComments) => {
        if (err) {
          console.error('❌ Erreur lors de la recherche des commentaires de test:', err);
          return;
        }

        console.log(`\n🔍 Commentaires de test trouvés: ${testComments.length}`);
        
        if (testComments.length > 0) {
          console.log('\n🗑️  Commentaires de test à supprimer:');
          testComments.forEach(comment => {
            console.log(`- ID: ${comment.id}, Commentaire: "${comment.commentaire}"`);
          });

          // Supprimer les commentaires de test
          const deleteTestCommentsQuery = `
            DELETE FROM commentaires 
            WHERE commentaire LIKE '%test%' 
               OR commentaire LIKE '%Test%' 
               OR commentaire LIKE '%TEST%'
               OR commentaire LIKE '%debug%'
               OR commentaire LIKE '%Debug%'
               OR commentaire LIKE '%temporaire%'
               OR commentaire LIKE '%temp%'
               OR commentaire LIKE '%script%'
               OR commentaire LIKE '%automatique%'
               OR commentaire = 'Commentaire de test'
               OR commentaire = 'Test commentaire'
               OR commentaire = 'Commentaire test'
               OR commentaire = 'Test de commentaire'
               OR commentaire = 'Commentaire vide'
               OR commentaire = 'Commentaire invalide'
               OR commentaire = 'Commentaire créé par script'
               OR commentaire = 'Commentaire automatique'
          `;

          connection.query(deleteTestCommentsQuery, (err, result) => {
            if (err) {
              console.error('❌ Erreur lors de la suppression des commentaires de test:', err);
              return;
            }

            console.log(`\n✅ ${result.affectedRows} commentaires de test supprimés`);

            // Vérifier l'état après nettoyage
            connection.query(getAllCommentsQuery, (err, remainingComments) => {
              if (err) {
                console.error('❌ Erreur lors de la vérification finale:', err);
                return;
              }

              console.log(`\n📊 Nombre de commentaires restants: ${remainingComments.length}`);

              if (remainingComments.length > 0) {
                console.log('\n📋 Commentaires restants (légitimes):');
                remainingComments.forEach(comment => {
                  const nom = comment.utilisateur_nom || 'Utilisateur inconnu';
                  const prenom = comment.utilisateur_prenom || '';
                  console.log(`- ID: ${comment.id}, Livre: ${comment.livre_id}, User: ${comment.utilisateur_id} (${nom} ${prenom}), Commentaire: "${comment.commentaire.substring(0, 50)}..."`);
                });
              }

              console.log('\n🧹 Nettoyage terminé avec succès!');
              connection.end();
            });
          });
        } else {
          console.log('\n✅ Aucun commentaire de test trouvé');
          console.log('\n🧹 Nettoyage terminé avec succès!');
          connection.end();
        }
      });
    });

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    connection.end();
  }
}

// Exécuter le nettoyage
cleanTestComments();
