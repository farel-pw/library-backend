const AuthService = require('../services/AuthService');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(401).json({ error: true, message: 'Accès refusé. Token manquant.' });
  }

  try {
    // Supprimer "Bearer " du token s'il est présent
    const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    
    const decoded = AuthService.verifyToken(actualToken);
    if (!decoded) {
      return res.status(401).json({ error: true, message: 'Token invalide.' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: true, message: 'Token invalide.' });
  }
};

const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: true, message: 'Accès refusé : réservé aux administrateurs' });
  }
  next();
};

module.exports = {
  verifyToken,
  verifyAdmin
};
