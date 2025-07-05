const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

class AuthService {
  static async register(userData) {
    try {
      // Vérifier si l'email existe déjà
      const existingUser = await User.findByEmail(userData.email);
      if (existingUser.length > 0) {
        return { error: true, message: "Email Id already registered" };
      }

      // Hasher le mot de passe
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      const newUser = {
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        mot_de_passe: hashedPassword,
        role: userData.role || 'etudiant'
      };

      const result = await User.create(newUser);
      return { error: false, message: "Success", id: result.insertId };
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return { error: true, message: "Error creating user" };
    }
  }

  static async login(email, password) {
    try {
      const users = await User.findByEmail(email);
      if (users.length === 0) {
        return { error: true, message: "Email ou mot de passe incorrect" };
      }

      const user = users[0];
      const isPasswordValid = await bcrypt.compare(password, user.mot_de_passe);
      
      if (!isPasswordValid) {
        return { error: true, message: "Email ou mot de passe incorrect" };
      }

      // Générer le token JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        },
        config.secret,
        { expiresIn: '24h' }
      );

      return {
        error: false,
        message: "Login successful",
        token: token,
        user: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return { error: true, message: "Error during login" };
    }
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, config.secret);
    } catch (error) {
      return null;
    }
  }
}

module.exports = AuthService;
