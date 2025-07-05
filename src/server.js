const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { logInfo, logError } = require('./utils/logger');

const app = express();

// Middlewares globaux
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use('/', routes);

// Middleware de gestion des erreurs
app.use(notFound);
app.use(errorHandler);

// Démarrage du serveur
const startServer = () => {
  try {
    app.listen(config.server.port, () => {
      logInfo(`Serveur démarré et écoute sur le port ${config.server.port}`);
    });
  } catch (error) {
    logError('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Gestion des erreurs non gérées
process.on('uncaughtException', (error) => {
  logError('Exception non gérée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError('Promesse rejetée non gérée:', reason);
  process.exit(1);
});

startServer();

module.exports = app;
