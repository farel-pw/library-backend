const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Erreur de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: true,
      message: 'Données invalides',
      details: err.message
    });
  }

  // Erreur de token JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: true,
      message: 'Token invalide'
    });
  }

  // Erreur de base de données
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        return res.status(409).json({
          error: true,
          message: 'Données déjà existantes'
        });
      case 'ER_NO_REFERENCED_ROW_2':
        return res.status(400).json({
          error: true,
          message: 'Référence invalide'
        });
      default:
        return res.status(500).json({
          error: true,
          message: 'Erreur de base de données'
        });
    }
  }

  // Erreur générique
  return res.status(500).json({
    error: true,
    message: 'Erreur interne du serveur'
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({
    error: true,
    message: 'Route non trouvée'
  });
};

module.exports = {
  errorHandler,
  notFound
};
