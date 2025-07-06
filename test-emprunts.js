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
  
  // Tester les calculs d'emprunts
  console.log('\n📚 Analyse des emprunts:');
  
  // Tous les emprunts
  connection.query('SELECT * FROM emprunts ORDER BY date_emprunt DESC', (err, emprunts) => {
    if (err) {
      console.error('❌ Erreur emprunts:', err.message);
    } else {
      console.log('\n🔍 Détail des emprunts:');
      emprunts.forEach(emprunt => {
        const dateRetourPrevue = new Date(emprunt.date_retour_prevue);
        const maintenant = new Date();
        const enRetard = !emprunt.date_retour_effective && dateRetourPrevue < maintenant;
        const enCours = !emprunt.date_retour_effective;
        
        console.log(`- Emprunt ${emprunt.id}: ${enCours ? 'EN COURS' : 'RENDU'} ${enRetard ? '(EN RETARD)' : ''}`);
        console.log(`  Date retour prévue: ${dateRetourPrevue.toLocaleDateString('fr-FR')}`);
        console.log(`  Date retour effective: ${emprunt.date_retour_effective || 'Non rendu'}`);
      });
      
      // Statistiques calculées
      const totalEmprunts = emprunts.length;
      const empruntsActifs = emprunts.filter(e => !e.date_retour_effective).length;
      const empruntsEnRetard = emprunts.filter(e => {
        const dateRetourPrevue = new Date(e.date_retour_prevue);
        const maintenant = new Date();
        return !e.date_retour_effective && dateRetourPrevue < maintenant;
      }).length;
      
      console.log('\n📊 Statistiques calculées:');
      console.log(`Total emprunts: ${totalEmprunts}`);
      console.log(`Emprunts actifs (en cours): ${empruntsActifs}`);
      console.log(`Emprunts en retard: ${empruntsEnRetard}`);
      
      // Tester la requête du modèle Analytics
      const query = `
        SELECT 
          (SELECT COUNT(*) FROM emprunts) as total_emprunts,
          (SELECT COUNT(*) FROM emprunts WHERE date_retour_effective IS NULL) as emprunts_actifs,
          (SELECT COUNT(*) FROM emprunts WHERE date_retour_effective IS NULL AND date_retour_prevue < CURDATE()) as emprunts_en_retard
      `;
      
      connection.query(query, (err, stats) => {
        if (err) {
          console.error('❌ Erreur requête stats:', err.message);
        } else {
          console.log('\n📈 Statistiques depuis la requête Analytics:');
          console.log('Total emprunts:', stats[0].total_emprunts);
          console.log('Emprunts actifs:', stats[0].emprunts_actifs);
          console.log('Emprunts en retard:', stats[0].emprunts_en_retard);
        }
        connection.end();
      });
    }
  });
});
