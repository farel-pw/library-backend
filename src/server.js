/**
 * Serveur principal de l'application Bibliothèque
 * 
 * Ce fichier configure et démarre le serveur Express.js qui gère :
 * - L'API REST pour la gestion de la bibliothèque
 * - L'authentification des utilisateurs
 * - Les opérations CRUD sur les livres, emprunts, réservations
 * - Les statistiques et analytics
 * - Les notifications automatiques
 * 
 * @author Votre Nom
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { logInfo, logError } = require('./utils/logger');

// Initialisation de l'application Express
const app = express();

// Configuration des middlewares globaux
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
})); // Gestion CORS pour permettre les requêtes cross-origin

app.use(bodyParser.urlencoded({ extended: true })); // Parse les données URL-encoded
app.use(bodyParser.json()); // Parse les données JSON

// Configuration des routes principales
// Toutes les routes de l'API sont montées à la racine
app.use('/', routes);

// Middlewares de gestion d'erreurs (doivent être en dernier)
app.use(notFound); // Gestion des routes non trouvées (404)
app.use(errorHandler); // Gestion globale des erreurs

/**
 * Démarrage du serveur HTTP
 * Configure le serveur pour écouter sur le port spécifié dans la configuration
 */
const startServer = () => {
  try {
    app.listen(config.server.port, () => {
      logInfo(`🚀 Serveur Bibliothèque démarré avec succès`);
      logInfo(`📡 Écoute sur le port ${config.server.port}`);
      logInfo(`🌐 URL: http://localhost:${config.server.port}`);
      logInfo(`📂 Environnement: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logError('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

/**
 * Gestion des erreurs globales non gérées
 * Ces handlers capturent les erreurs qui ne sont pas gérées par les middlewares
 */

// Gestion des exceptions non capturées
process.on('uncaughtException', (error) => {
  logError('💥 Exception non gérée détectée:', error);
  logError('🔄 Arrêt du serveur pour éviter un état instable');
  process.exit(1);
});

// Gestion des promesses rejetées non gérées
process.on('unhandledRejection', (reason, promise) => {
  logError('🚫 Promesse rejetée non gérée:', reason);
  logError('🔄 Arrêt du serveur pour éviter un état instable');
  process.exit(1);
});

// Démarrage effectif du serveur
startServer();

module.exports = app;
