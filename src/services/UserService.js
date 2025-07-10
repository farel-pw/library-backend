const User = require('../models/User');

class UserService {
  static async getAllUsers() {
    try {
      const users = await User.findAll();
      return { error: false, data: users };
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return { error: true, message: "Error fetching users" };
    }
  }

  static async getUserById(id) {
    try {
      console.log('👤 UserService: Getting user by ID:', id);
      const user = await User.findById(id);
      console.log('👤 UserService: User found:', user ? 'YES' : 'NO');
      
      if (!user) {
        return { error: true, message: "User not found" };
      }
      
      // Supprimer le mot de passe de la réponse
      const { mot_de_passe, ...userWithoutPassword } = user;
      return { error: false, data: userWithoutPassword };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return { error: true, message: "Error fetching user" };
    }
  }

  static async updateUser(id, userData) {
    try {
      console.log('✏️ UserService.updateUser: ID =', id, 'Type:', typeof id);
      console.log('✏️ UserService.updateUser: userData =', userData);
      
      const result = await User.update(id, userData);
      console.log('✏️ UserService.updateUser: result =', result);
      
      if (result.affectedRows === 0) {
        return { error: true, message: "User not found" };
      }
      return { error: false, message: "User updated successfully" };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      return { error: true, message: "Error updating user" };
    }
  }

  static async deleteUser(id) {
    try {
      const result = await User.delete(id);
      if (result.affectedRows === 0) {
        return { error: true, message: "User not found" };
      }
      return { error: false, message: "User deleted successfully" };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      return { error: true, message: "Error deleting user" };
    }
  }

  static async createUser(userData) {
    try {
      console.log('📝 UserService: Creating user with data:', userData);
      
      // Vérifier si l'email existe déjà
      const existingUsers = await User.findByEmail(userData.email);
      if (existingUsers.length > 0) {
        return { error: true, message: "Email déjà utilisé" };
      }

      // Préparer les données utilisateur avec hashage du mot de passe
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const newUserData = {
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        mot_de_passe: hashedPassword,
        role: userData.role || 'etudiant',
        useractive: 1, // Actif par défaut
        date_creation: new Date(),
        date_maj: new Date()
      };

      console.log('📝 UserService: Prepared data:', { ...newUserData, mot_de_passe: '[HIDDEN]' });
      
      const result = await User.create(newUserData);
      console.log('📝 UserService: Create result:', result);
      
      return { 
        error: false, 
        message: "Utilisateur créé avec succès", 
        id: result.insertId 
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      return { error: true, message: "Error creating user" };
    }
  }

  static async toggleUserStatus(id, active) {
    try {
      console.log('🔄 UserService: Toggle status for user', id, 'to active:', active);
      const useractive = active ? 1 : 0;
      const result = await User.update(id, { useractive });
      console.log('🔄 UserService: Toggle result:', result);
      
      if (result.affectedRows === 0) {
        return { error: true, message: "User not found" };
      }
      
      const status = active ? 'actif' : 'inactif';
      return { error: false, message: `Statut utilisateur mis à jour: ${status}` };
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      return { error: true, message: "Error updating user status" };
    }
  }
}

module.exports = UserService;
