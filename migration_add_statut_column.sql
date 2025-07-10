-- Migration pour ajouter la colonne statut à la table emprunts
-- Date: 2025-07-10

-- Ajouter la colonne statut
ALTER TABLE emprunts 
ADD COLUMN statut VARCHAR(20) DEFAULT 'en_cours' AFTER date_retour_effective;

-- Mettre à jour les statuts existants basés sur la colonne rendu et date_retour_effective
UPDATE emprunts 
SET statut = CASE 
  WHEN date_retour_effective IS NOT NULL THEN 'retourne'
  WHEN rendu = 1 THEN 'retourne'
  ELSE 'en_cours'
END;

-- Ajouter un index pour améliorer les performances
CREATE INDEX idx_emprunts_statut ON emprunts(statut);

-- Afficher le résultat
SELECT 'Migration terminée - Colonne statut ajoutée à la table emprunts' as message;
