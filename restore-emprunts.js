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
  
  // Vider la table emprunts d'abord
  connection.query('DELETE FROM emprunts', (err) => {
    if (err) {
      console.error('Erreur suppression:', err.message);
      return;
    }
    
    // Insérer des emprunts récents (derniers 30 jours) - AUCUN EN RETARD
    const today = new Date();
    const emprunts = [
      {
        utilisateur_id: 2,
        livre_id: 1,
        date_emprunt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // Il y a 5 jours
        date_retour_prevue: new Date(today.getTime() + 9 * 24 * 60 * 60 * 1000), // Dans 9 jours
        date_retour_effective: null,
        rendu: false
      },
      {
        utilisateur_id: 3,
        livre_id: 2,
        date_emprunt: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000), // Il y a 10 jours
        date_retour_prevue: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000), // Dans 4 jours
        date_retour_effective: null,
        rendu: false
      },
      {
        utilisateur_id: 4,
        livre_id: 3,
        date_emprunt: new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000), // Il y a 8 jours
        date_retour_prevue: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000), // Dans 6 jours
        date_retour_effective: null,
        rendu: false
      },
      {
        utilisateur_id: 5,
        livre_id: 4,
        date_emprunt: new Date(today.getTime() - 25 * 24 * 60 * 60 * 1000), // Il y a 25 jours
        date_retour_prevue: new Date(today.getTime() - 11 * 24 * 60 * 60 * 1000), // Il y a 11 jours (mais RENDU)
        date_retour_effective: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // Rendu il y a 2 jours
        rendu: true
      },
      {
        utilisateur_id: 2,
        livre_id: 5,
        date_emprunt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // Il y a 7 jours
        date_retour_prevue: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
        date_retour_effective: null,
        rendu: false
      },
      {
        utilisateur_id: 3,
        livre_id: 6,
        date_emprunt: new Date(today.getTime() - 12 * 24 * 60 * 60 * 1000), // Il y a 12 jours
        date_retour_prevue: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // Dans 2 jours
        date_retour_effective: null,
        rendu: false
      }
    ];
    
    emprunts.forEach((emprunt, index) => {
      const query = `INSERT INTO emprunts (utilisateur_id, livre_id, date_emprunt, date_retour_prevue, date_retour_effective, rendu) VALUES (?, ?, ?, ?, ?, ?)`;
      const values = [
        emprunt.utilisateur_id,
        emprunt.livre_id,
        emprunt.date_emprunt.toISOString().slice(0, 19).replace('T', ' '),
        emprunt.date_retour_prevue.toISOString().slice(0, 19).replace('T', ' '),
        emprunt.date_retour_effective ? emprunt.date_retour_effective.toISOString().slice(0, 19).replace('T', ' ') : null,
        emprunt.rendu
      ];
      
      connection.query(query, values, (err, result) => {
        if (err) {
          console.error(`❌ Erreur emprunt ${index + 1}:`, err.message);
        } else {
          console.log(`✅ Emprunt ${index + 1} inséré`);
        }
        
        // Fermer la connexion après le dernier emprunt
        if (index === emprunts.length - 1) {
          setTimeout(() => {
            connection.end();
            console.log('🎉 Emprunts restaurés avec succès !');
            
            // Vérifier le résultat
            const connection2 = mysql.createConnection({
              host: process.env.DB_HOST || 'localhost',
              user: process.env.DB_USER || 'root',
              password: process.env.DB_PASSWORD || '',
              database: process.env.DB_NAME || 'bibliotheque',
              port: parseInt(process.env.DB_PORT) || 3306
            });
            
            connection2.query('SELECT COUNT(*) as count FROM emprunts', (err, result) => {
              if (!err) {
                console.log(`📊 Total emprunts: ${result[0].count}`);
              }
              connection2.end();
            });
          }, 1000);
        }
      });
    });
  });
});
