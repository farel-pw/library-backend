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
      const user = await User.findById(id);
      if (!user) {
        return { error: true, message: "User not found" };
      }
      
      // Supprimer le mot de passe de la réponse
      const { password, ...userWithoutPassword } = user;
      return { error: false, data: userWithoutPassword };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return { error: true, message: "Error fetching user" };
    }
  }

  static async updateUser(id, userData) {
    try {
      const result = await User.update(id, userData);
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
}

module.exports = UserService;
