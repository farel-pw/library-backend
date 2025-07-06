const mysql = require('mysql2/promise');

const seeder = {
  up: async (connection) => {
    console.log('🌱 Mise à jour des données d\'emprunts avec des dates réalistes...');

    // Supprimer les anciens emprunts
    await connection.execute('DELETE FROM emprunts');
    console.log('✅ Anciens emprunts supprimés');

    // Ajouter des emprunts avec des dates réalistes
    const today = new Date();
    const formatDate = (date) => date.toISOString().split('T')[0];

    // Emprunt 1: En cours, dans les temps (emprunté il y a 5 jours, à rendre dans 9 jours)
    const emprunt1Date = new Date(today);
    emprunt1Date.setDate(today.getDate() - 5);
    const emprunt1Retour = new Date(today);
    emprunt1Retour.setDate(today.getDate() + 9);

    // Emprunt 2: En retard (emprunté il y a 20 jours, devait être rendu il y a 6 jours)
    const emprunt2Date = new Date(today);
    emprunt2Date.setDate(today.getDate() - 20);
    const emprunt2Retour = new Date(today);
    emprunt2Retour.setDate(today.getDate() - 6);

    // Emprunt 3: En cours, bientôt l'échéance (emprunté il y a 12 jours, à rendre dans 2 jours)
    const emprunt3Date = new Date(today);
    emprunt3Date.setDate(today.getDate() - 12);
    const emprunt3Retour = new Date(today);
    emprunt3Retour.setDate(today.getDate() + 2);

    // Emprunt 4: Rendu (emprunté il y a 30 jours, rendu il y a 20 jours)
    const emprunt4Date = new Date(today);
    emprunt4Date.setDate(today.getDate() - 30);
    const emprunt4Retour = new Date(today);
    emprunt4Retour.setDate(today.getDate() - 16);
    const emprunt4RenduDate = new Date(today);
    emprunt4RenduDate.setDate(today.getDate() - 20);

    // Emprunt 5: En retard avec pénalités (emprunté il y a 25 jours, devait être rendu il y a 11 jours)
    const emprunt5Date = new Date(today);
    emprunt5Date.setDate(today.getDate() - 25);
    const emprunt5Retour = new Date(today);
    emprunt5Retour.setDate(today.getDate() - 11);

    const emprunts = [
      {
        utilisateur_id: 1, // Jean Dupont
        livre_id: 1, // Le Petit Prince
        date_emprunt: formatDate(emprunt1Date),
        date_retour_prevue: formatDate(emprunt1Retour),
        date_retour_effective: null,
        penalites: 0.00,
        notes_admin: null
      },
      {
        utilisateur_id: 2, // Marie Martin
        livre_id: 2, // 1984
        date_emprunt: formatDate(emprunt2Date),
        date_retour_prevue: formatDate(emprunt2Retour),
        date_retour_effective: null,
        penalites: 3.00, // 6 jours de retard à 0.50€/jour
        notes_admin: 'Utilisateur notifié du retard par email'
      },
      {
        utilisateur_id: 3, // Pierre Bernard
        livre_id: 3, // L'Étranger
        date_emprunt: formatDate(emprunt3Date),
        date_retour_prevue: formatDate(emprunt3Retour),
        date_retour_effective: null,
        penalites: 0.00,
        notes_admin: null
      },
      {
        utilisateur_id: 4, // Sophie Thomas
        livre_id: 4, // Les Misérables
        date_emprunt: formatDate(emprunt4Date),
        date_retour_prevue: formatDate(emprunt4Retour),
        date_retour_effective: formatDate(emprunt4RenduDate),
        penalites: 0.00,
        notes_admin: 'Rendu en bon état'
      },
      {
        utilisateur_id: 1, // Jean Dupont (deuxième emprunt)
        livre_id: 5, // Guerre et Paix
        date_emprunt: formatDate(emprunt5Date),
        date_retour_prevue: formatDate(emprunt5Retour),
        date_retour_effective: null,
        penalites: 5.50, // 11 jours de retard à 0.50€/jour
        notes_admin: 'Retard important, utilisateur contacté plusieurs fois'
      }
    ];

    for (const emprunt of emprunts) {
      await connection.execute(
        `INSERT INTO emprunts (utilisateur_id, livre_id, date_emprunt, date_retour_prevue, date_retour_effective, penalites, notes_admin) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [emprunt.utilisateur_id, emprunt.livre_id, emprunt.date_emprunt, emprunt.date_retour_prevue, 
         emprunt.date_retour_effective, emprunt.penalites, emprunt.notes_admin]
      );
    }

    console.log(`✅ ${emprunts.length} emprunts réalistes créés`);
    console.log('📅 Dates des emprunts:');
    console.log(`   - Aujourd'hui: ${formatDate(today)}`);
    console.log(`   - Emprunt 1 (en cours): ${formatDate(emprunt1Date)} → ${formatDate(emprunt1Retour)}`);
    console.log(`   - Emprunt 2 (en retard): ${formatDate(emprunt2Date)} → ${formatDate(emprunt2Retour)}`);
    console.log(`   - Emprunt 3 (échéance proche): ${formatDate(emprunt3Date)} → ${formatDate(emprunt3Retour)}`);
    console.log(`   - Emprunt 4 (rendu): ${formatDate(emprunt4Date)} → ${formatDate(emprunt4Retour)} (rendu: ${formatDate(emprunt4RenduDate)})`);
    console.log(`   - Emprunt 5 (en retard avec pénalités): ${formatDate(emprunt5Date)} → ${formatDate(emprunt5Retour)}`);
  },

  down: async (connection) => {
    console.log('🔄 Suppression des emprunts réalistes...');
    await connection.execute('DELETE FROM emprunts');
    console.log('✅ Emprunts supprimés');
  }
};

module.exports = seeder;
