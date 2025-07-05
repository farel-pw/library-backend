const mysql = require('mysql2');
const connection = require('../config/database');

class Book {
  static async findAll() {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM ??";
      const table = ["livres"];
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
      const table = ["livres", "id", id];
      const formattedQuery = mysql.format(query, table);
      
      connection.query(formattedQuery, (err, rows) => {
        if (err) reject(err);
        else resolve(rows[0]);
      });
    });
  }

  static async findByIsbn(isbn) {
    return new Promise((resolve, reject) => {
      const query = "SELECT isbn FROM ?? WHERE ?? = ?";
      const table = ["livres", "isbn", isbn];
      const formattedQuery = mysql.format(query, table);
      
      connection.query(formattedQuery, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async create(bookData) {
    return new Promise((resolve, reject) => {
      const query = "INSERT INTO ?? SET ?";
      const table = ["livres"];
      const formattedQuery = mysql.format(query, table);
      
      connection.query(formattedQuery, bookData, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async update(id, bookData) {
    return new Promise((resolve, reject) => {
      const query = "UPDATE ?? SET ? WHERE ?? = ?";
      const table = ["livres", "id", id];
      const formattedQuery = mysql.format(query, table);
      
      connection.query(formattedQuery, bookData, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      const query = "DELETE FROM ?? WHERE ?? = ?";
      const table = ["livres", "id", id];
      const formattedQuery = mysql.format(query, table);
      
      connection.query(formattedQuery, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
}

module.exports = Book;
