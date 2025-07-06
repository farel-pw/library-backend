const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import du fichier de configuration
const config = require('./src/config');

// Import des routes
const authRoutes = require('./src/routes/auth');
const bookRoutes = require('./src/routes/books');
const userRoutes = require('./src/routes/users');
const borrowRoutes = require('./src/routes/borrows');
const reservationRoutes = require('./src/routes/reservations');
const commentRoutes = require('./src/routes/comments');
const adminRoutes = require('./src/routes/admin');

// Middleware
const errorHandler = require('./src/middleware/errorHandler');

// Test de connexion à la base de données
const connection = require('./src/config/database');

const app = express();
const PORT = config.server.port || 4401;

// Middleware de base
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Route de test
app.get('/', (req, res) => {
  console.log('🏠 Root route accessed');
  res.json({ 
    message: "API Bibliothèque - Serveur en fonctionnement",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: ['/signup', '/userlogin'],
      books: ['/livres'],
      users: ['/users'],
      borrows: ['/emprunts'],
      reservations: ['/reservations'],
      comments: ['/commentaires'],
      admin: ['/admin/*']
    }
  });
});

// Routes
app.use('/', authRoutes);
app.use('/livres', bookRoutes);
app.use('/users', userRoutes);
app.use('/emprunts', borrowRoutes);
app.use('/reservations', reservationRoutes);
app.use('/commentaires', commentRoutes);
app.use('/admin', adminRoutes);

// Route de fallback pour debug
app.use('*', (req, res) => {
  console.log('❓ Route non trouvée:', req.method, req.originalUrl);
  res.status(404).json({ 
    error: true, 
    message: `Route ${req.method} ${req.originalUrl} non trouvée`,
    availableRoutes: {
      auth: ['/signup', '/userlogin'],
      books: ['/livres'],
      users: ['/users'],
      borrows: ['/emprunts'],
      reservations: ['/reservations'],
      comments: ['/commentaires'],
      admin: ['/admin/*']
    }
  });
});

// Middleware de gestion d'erreurs
app.use(errorHandler);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log('🚀 ===================================');
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🚀 URL: http://localhost:${PORT}`);
  console.log('🚀 ===================================');
  console.log('📊 Configuration:', {
    NODE_ENV: process.env.NODE_ENV,
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_NAME: process.env.DB_NAME,
    PORT: PORT
  });
  console.log('🚀 ===================================');
});

// Gestion des erreurs non gérées
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
