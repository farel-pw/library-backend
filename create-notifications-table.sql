-- Création de la table notifications manquante
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  titre VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'emprunt_retard', 'reservation_validee', 'livre_disponible') DEFAULT 'info',
  lu BOOLEAN DEFAULT FALSE,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_lecture TIMESTAMP NULL,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_notifications_utilisateur ON notifications(utilisateur_id);
CREATE INDEX idx_notifications_lu ON notifications(lu);
CREATE INDEX idx_notifications_type ON notifications(type);
