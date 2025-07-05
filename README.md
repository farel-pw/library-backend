# API Backend - Bibliothèque

## Structure du Projet

```
Backend 2/
├── src/
│   ├── config/           # Configuration (base de données, JWT, etc.)
│   │   ├── index.js      # Configuration générale
│   │   └── database.js   # Configuration base de données
│   ├── controllers/      # Contrôleurs pour gérer les requêtes
│   │   ├── AuthController.js
│   │   ├── UserController.js
│   │   ├── BookController.js
│   │   ├── BorrowController.js
│   │   ├── ReservationController.js
│   │   └── CommentController.js
│   ├── middleware/       # Middleware personnalisés
│   │   ├── auth.js       # Authentification JWT
│   │   ├── admin.js      # Vérification rôle admin
│   │   └── validation.js # Validation des données
│   ├── models/          # Modèles de données
│   │   ├── User.js
│   │   ├── Book.js
│   │   ├── Borrow.js
│   │   ├── Reservation.js
│   │   └── Comment.js
│   ├── routes/          # Définition des routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── books.js
│   │   ├── borrows.js
│   │   ├── reservations.js
│   │   └── comments.js
│   ├── services/        # Logique métier
│   │   ├── AuthService.js
│   │   ├── UserService.js
│   │   ├── BookService.js
│   │   ├── BorrowService.js
│   │   ├── ReservationService.js
│   │   └── CommentService.js
│   ├── utils/           # Utilitaires
│   │   ├── response.js  # Formatage des réponses
│   │   └── validation.js # Helpers de validation
│   └── server.js        # Point d'entrée de l'application
├── database/            # Scripts de base de données
│   ├── migrations/      # Scripts de migration
│   ├── seeders/         # Scripts de données de test
│   └── MigrationManager.js # Gestionnaire de migrations
├── scripts/             # Scripts d'automatisation
│   ├── migrate.js       # Migration seule
│   ├── seed.js          # Seeding seul
│   ├── drop.js          # Suppression des tables
│   ├── fresh.js         # Drop + Migration
│   └── migrate-seed.js  # Drop + Migration + Seeding
├── package.json
├── .gitignore
└── README.md
```

## Installation et Démarrage

```bash
# Installation des dépendances
npm install

# Configuration de la base de données
# 1. Copier le fichier .env.example vers .env
cp .env.example .env

# 2. Modifier les paramètres de connexion dans .env selon votre configuration

# 3. Exécuter les migrations et seeders
npm run db:migrate-seed

# Démarrage en développement
npm run dev

# Démarrage en production
npm start
```

## Scripts de Base de Données

### Gestionnaire Interactif
```bash
# Lance un menu interactif pour gérer la base de données
npm run db:manager
```

### Scripts Individuels
```bash
# Migration seule (crée les tables)
npm run db:migrate

# Seeding seul (insère les données de test)
npm run db:seed

# Supprimer toutes les tables
npm run db:drop

# Drop + Migration (base fraîche sans données)
npm run db:fresh

# Drop + Migration + Seeding (base complète avec données de test)
npm run db:migrate-seed

# Reset complet (équivalent à db:drop puis db:migrate puis db:seed)
npm run db:reset
```

### Description des Scripts

- **`db:migrate`** : Exécute uniquement les migrations pour créer les tables
- **`db:seed`** : Insère les données de test dans les tables existantes
- **`db:drop`** : Supprime toutes les tables et données
- **`db:fresh`** : Recrée une base de données propre sans données
- **`db:migrate-seed`** : Script complet qui supprime tout, recrée les tables et insère les données de test
- **`db:reset`** : Équivalent à `db:migrate-seed` mais en chaînant les commandes

### Données de Test Incluses

Le seeder inclut :
- **1 administrateur** : `admin@bibliotheque.com` / `admin123`
- **4 utilisateurs** : `jean.dupont@example.com`, etc. / `password123`
- **10 livres** : Classiques de la littérature française et internationale
- **Emprunts, commentaires et réservations** : Données d'exemple pour tester l'application

## Structure des Données

- **Utilisateurs** : Gestion des comptes utilisateurs et administrateurs
- **Livres** : Catalogue des livres de la bibliothèque
- **Emprunts** : Suivi des emprunts de livres
- **Réservations** : Système de réservation des livres
- **Commentaires** : Avis et notes sur les livres

## Architecture

L'API suit une architecture MVC (Model-View-Controller) avec une séparation claire des responsabilités :

- **Controllers** : Gèrent les requêtes HTTP et les réponses
- **Services** : Contiennent la logique métier
- **Models** : Gèrent les interactions avec la base de données
- **Routes** : Définissent les endpoints de l'API
- **Middleware** : Gèrent l'authentification, les permissions et la validation

## Sécurité

- Authentification JWT
- Hashage des mots de passe avec bcrypt
- Validation des données d'entrée
- Gestion des rôles (utilisateur/administrateur)
