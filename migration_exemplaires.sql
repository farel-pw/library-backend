-- Migration pour ajouter la gestion des exemplaires

-- 1. Ajouter les colonnes pour gérer les exemplaires
ALTER TABLE livres ADD COLUMN exemplaires_total INT DEFAULT 3 COMMENT 'Nombre total d\'exemplaires disponibles';
ALTER TABLE livres ADD COLUMN exemplaires_disponibles INT DEFAULT 3 COMMENT 'Nombre d\'exemplaires actuellement disponibles';

-- 2. Mettre à jour les livres existants
UPDATE livres SET 
  exemplaires_total = 3,
  exemplaires_disponibles = CASE 
    WHEN disponible = 1 THEN 3 
    ELSE 0 
  END;

-- 3. Ajouter des colonnes supplémentaires aux emprunts pour les pénalités
ALTER TABLE emprunts ADD COLUMN penalites DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Montant des pénalités de retard';
ALTER TABLE emprunts ADD COLUMN notes_admin TEXT COMMENT 'Notes administratives sur l\'emprunt';

-- 4. Index pour optimiser les requêtes de disponibilité
CREATE INDEX idx_livres_disponibles ON livres(exemplaires_disponibles);
CREATE INDEX idx_emprunts_retour ON emprunts(date_retour_effective);
CREATE INDEX idx_emprunts_livre_actifs ON emprunts(livre_id, date_retour_effective);
