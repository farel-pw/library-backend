const AuthService = require('../services/AuthService');

class AuthController {
  static async register(req, res) {
    try {
      const result = await AuthService.register(req.body);
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: true, message: "Email et mot de passe requis" });
      }

      const result = await AuthService.login(email, password);
      
      if (result.error) {
        return res.status(401).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static welcome(req, res) {
    res.json({ message: "Bienvenue sur l'API de la bibliothèque" });
  }
}

module.exports = AuthController;
