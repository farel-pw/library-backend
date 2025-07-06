const mysql = require('mysql2');
const connection = require('../config/database');

class User {
  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM ?? WHERE ?? = ?";
      const table = ["utilisateurs", "email", email];
      const formattedQuery = mysql.format(query, table);
      
      connection.query(formattedQuery, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM ?? WHERE ?? = ?";
      const table = ["utilisateurs", "id", id];
      const formattedQuery = mysql.format(query, table);
      
      connection.query(formattedQuery, (err, rows) => {
        if (err) reject(err);
        else resolve(rows[0]);
      });
    });
  }

  static async findAll() {
    return new Promise((resolve, reject) => {
      const query = "SELECT id, nom, prenom, email, role FROM ??";
      const table = ["utilisateurs"];
      const formattedQuery = mysql.format(query, table);
      
      connection.query(formattedQuery, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async create(userData) {
    return new Promise((resolve, reject) => {
      const query = "INSERT INTO ?? SET ?";
      const table = ["utilisateurs"];
      const formattedQuery = mysql.format(query, table);
      
      connection.query(formattedQuery, userData, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async update(id, userData) {
    return new Promise((resolve, reject) => {
      const query = "UPDATE ?? SET ? WHERE id = ?";
      const table = ["utilisateurs"];
      const formattedQuery = mysql.format(query, table);
      
      console.log("🔄 Update Query:", formattedQuery);
      console.log("🔄 Update Data:", userData);
      console.log("🔄 Update ID:", id);
      
      connection.query(formattedQuery, [userData, id], (err, result) => {
        if (err) {
          console.error("❌ Update Error:", err);
          reject(err);
        } else {
          console.log("✅ Update Result:", result);
          resolve(result);
        }
      });
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      const query = "DELETE FROM ?? WHERE id = ?";
      const table = ["utilisateurs"];
      const formattedQuery = mysql.format(query, table);
      
      console.log("🗑️ Delete Query:", formattedQuery);
      console.log("🗑️ Delete ID:", id);
      
      connection.query(formattedQuery, [id], (err, result) => {
        if (err) {
          console.error("❌ Delete Error:", err);
          reject(err);
        } else {
          console.log("✅ Delete Result:", result);
          resolve(result);
        }
      });
    });
  }
}

module.exports = User;
