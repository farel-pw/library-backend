const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bibliotheque',
  port: parseInt(process.env.DB_PORT) || 3306
});

connection.connect(function(err) {
  if (err) {
    console.error('❌ Erreur de connexion:', err.message);
    process.exit(1);
  }
  
  console.log('✅ Connexion réussie');
  console.log('🔄 Mise à jour des dates d\'emprunts avec des dates récentes...');
  
  // Mettre à jour les emprunts avec des dates récentes
  const updates = [
    {
      id: 1,
      date_emprunt: '2025-07-01', // Il y a 5 jours
      date_retour_prevue: '2025-07-15', // Dans 9 jours - en cours
      date_retour_effective: null
    },
    {
      id: 2,
      date_emprunt: '2025-06-25', // Il y a 11 jours  
      date_retour_prevue: '2025-07-09', // Date passée de 3 jours - en retard
      date_retour_effective: null
    },
    {
      id: 3,
      date_emprunt: '2025-06-20', // Il y a 16 jours
      date_retour_prevue: '2025-07-04', // Date passée de 2 jours - en retard
      date_retour_effective: null
    },
    {
      id: 4,
      date_emprunt: '2025-06-15', // Il y a 21 jours
      date_retour_prevue: '2025-06-29', // Rendu à temps
      date_retour_effective: '2025-06-28' // rendu hier
    }
  ];
  
  let completed = 0;
  updates.forEach(update => {
    const query = `
      UPDATE emprunts 
      SET date_emprunt = ?, date_retour_prevue = ?, date_retour_effective = ?, rendu = ?
      WHERE id = ?
    `;
    
    connection.query(query, [
      update.date_emprunt, 
      update.date_retour_prevue, 
      update.date_retour_effective, 
      update.date_retour_effective ? 1 : 0, // rendu = 1 si date_retour_effective existe
      update.id
    ], (err, result) => {
      if (err) {
        console.error(`❌ Erreur mise à jour emprunt ${update.id}:`, err.message);
      } else {
        console.log(`✅ Emprunt ${update.id} mis à jour`);
      }
      
      completed++;
      if (completed === updates.length) {
        // Vérifier le résultat
        connection.query(`
          SELECT 
            id,
            date_emprunt,
            date_retour_prevue,
            date_retour_effective,
            CASE 
              WHEN date_retour_effective IS NOT NULL THEN 'rendu'
              WHEN date_retour_prevue < CURDATE() THEN 'en_retard'
              ELSE 'en_cours'
            END as statut_calcule,
            DATEDIFF(CURDATE(), date_retour_prevue) as jours_retard
          FROM emprunts 
          ORDER BY id
        `, (err, results) => {
          if (err) {
            console.error('❌ Erreur vérification:', err.message);
          } else {
            console.log('\n📋 Statuts des emprunts après mise à jour:');
            console.table(results);
          }
          connection.end();
        });
      }
    });
  });
});
