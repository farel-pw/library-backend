const bcrypt = require('bcrypt');

const seeder = {
  up: async (connection) => {
    console.log('🌱 Insertion des données de test...');

    // Utilisateurs de test
    const hashedPassword = await bcrypt.hash('password123', 10);
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);

    await connection.execute(`
      INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role) VALUES
      ('Admin', 'Système', '', ?, 'admin'),
      ('Dupont', 'Jean', 'jean.dadmin@bibliotheque.comupont@example.com', ?, 'etudiant'),
      ('Martin', 'Marie', 'marie.martin@example.com', ?, 'etudiant'),
      ('Bernard', 'Pierre', 'pierre.bernard@example.com', ?, 'etudiant'),
      ('Thomas', 'Sophie', 'sophie.thomas@example.com', ?, 'etudiant')
    `, [hashedAdminPassword, hashedPassword, hashedPassword, hashedPassword, hashedPassword]);
    console.log('✅ Utilisateurs insérés');

    // Livres de test
    await connection.execute(`
      INSERT INTO livres (titre, auteur, genre, isbn, annee_publication, description, disponible) VALUES
      ('Le Petit Prince', 'Antoine de Saint-Exupéry', 'Fiction', '9782070408504', 1943, 'Un conte philosophique et poétique sous l''apparence d''un conte pour enfants.', 1),
      ('1984', 'George Orwell', 'Science-Fiction', '9782070368228', 1949, 'Un roman dystopique qui dépeint une société totalitaire.', 1),
      ('L''Étranger', 'Albert Camus', 'Philosophie', '9782070360024', 1942, 'Roman de l''absurde qui raconte l''histoire de Meursault.', 1),
      ('Les Misérables', 'Victor Hugo', 'Classique', '9782070409228', 1862, 'Roman historique, social et philosophique.', 1),
      ('Madame Bovary', 'Gustave Flaubert', 'Classique', '9782070404490', 1857, 'L''histoire d''Emma Bovary, femme d''un médecin de campagne.', 1),
      ('Le Seigneur des Anneaux', 'J.R.R. Tolkien', 'Fantasy', '9782266154542', 1954, 'Épopée fantasy dans la Terre du Milieu.', 1),
      ('Harry Potter à l''école des sorciers', 'J.K. Rowling', 'Fantasy', '9782070541270', 1997, 'Les aventures du jeune sorcier Harry Potter.', 1),
      ('Pride and Prejudice', 'Jane Austen', 'Romance', '9780141439518', 1813, 'Roman sur les mœurs de la société anglaise du XIXe siècle.', 1),
      ('To Kill a Mockingbird', 'Harper Lee', 'Fiction', '9780061120084', 1960, 'Roman sur les inégalités raciales dans le Sud américain.', 1),
      ('The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', '9780743273565', 1925, 'Critique du rêve américain dans les années 1920.', 1)
    `);
    console.log('✅ Livres insérés');

    // Emprunts de test
    await connection.execute(`
      INSERT INTO emprunts (utilisateur_id, livre_id, date_emprunt, date_retour_prevue, rendu) VALUES
      (2, 1, '2024-12-01', '2024-12-15', TRUE),
      (3, 2, '2024-12-10', '2024-12-24', FALSE),
      (4, 3, '2024-12-15', '2024-12-29', FALSE),
      (5, 4, '2024-12-20', '2025-01-03', FALSE)
    `);
    console.log('✅ Emprunts insérés');

    // Commentaires de test
    await connection.execute(`
      INSERT INTO commentaires (utilisateur_id, livre_id, note, commentaire) VALUES
      (2, 1, 5, 'Un livre magnifique, plein de poésie et de sagesse. Je le recommande vivement !'),
      (3, 2, 4, 'Un classique incontournable. L''intrigue est captivante même si parfois un peu lourde.'),
      (4, 3, 4, 'Camus nous livre ici une réflexion profonde sur l''absurdité de l''existence.'),
      (5, 4, 5, 'Victor Hugo à son apogée. Une fresque sociale impressionnante.'),
      (2, 6, 5, 'Tolkien a créé un univers fantastique extraordinaire. Une lecture passionnante !'),
      (3, 7, 4, 'Harry Potter a bercé mon enfance. Toujours un plaisir de le relire.')
    `);
    console.log('✅ Commentaires insérés');

    // Réservations de test
    await connection.execute(`
      INSERT INTO reservations (utilisateur_id, livre_id, statut) VALUES
      (2, 5, 'en_attente'),
      (3, 8, 'en_attente'),
      (4, 9, 'validée'),
      (5, 10, 'en_attente')
    `);
    console.log('✅ Réservations insérées');

    // Logs de test
    await connection.execute(`
      INSERT INTO logs (utilisateur_id, action) VALUES
      (1, 'Connexion administrateur'),
      (2, 'Emprunt du livre: Le Petit Prince'),
      (3, 'Emprunt du livre: 1984'),
      (4, 'Ajout d''un commentaire sur L''Étranger'),
      (5, 'Réservation du livre: The Great Gatsby')
    `);
    console.log('✅ Logs insérés');

    console.log('🎉 Seeding terminé avec succès !');
  },

  down: async (connection) => {
    console.log('🧹 Suppression des données de test...');

    try {
      // Supprimer les données dans l'ordre inverse (seulement si les tables existent)
      await connection.execute('DELETE FROM logs WHERE 1=1');
      await connection.execute('DELETE FROM reservations WHERE 1=1');
      await connection.execute('DELETE FROM commentaires WHERE 1=1');
      await connection.execute('DELETE FROM emprunts WHERE 1=1');
      await connection.execute('DELETE FROM livres WHERE 1=1');
      await connection.execute('DELETE FROM utilisateurs WHERE 1=1');

      // Réinitialiser les AUTO_INCREMENT
      await connection.execute('ALTER TABLE logs AUTO_INCREMENT = 1');
      await connection.execute('ALTER TABLE reservations AUTO_INCREMENT = 1');
      await connection.execute('ALTER TABLE commentaires AUTO_INCREMENT = 1');
      await connection.execute('ALTER TABLE emprunts AUTO_INCREMENT = 1');
      await connection.execute('ALTER TABLE livres AUTO_INCREMENT = 1');
      await connection.execute('ALTER TABLE utilisateurs AUTO_INCREMENT = 1');

      console.log('✅ Toutes les données ont été supprimées');
    } catch (error) {
      // Si les tables n'existent pas, c'est normal lors d'un drop
      console.log('✅ Toutes les données ont été supprimées');
    }
  }
};

module.exports = seeder;
