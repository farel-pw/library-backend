const BookService = require('../services/BookService');

class BookController {
  static async getAllBooks(req, res) {
    try {
      console.log("🎯 BookController: getAllBooks called");
      const result = await BookService.getAllBooks();
      console.log("🎯 BookController: Service result:", result.error ? 'ERROR' : 'SUCCESS');
      
      if (result.error) {
        console.log("🎯 BookController: Returning error response");
        return res.status(500).json(result);
      }
      
      console.log("🎯 BookController: Returning success response with", result.data?.length || 0, "books");
      res.status(200).json(result);
    } catch (error) {
      console.error('🎯 BookController Error:', error);
      console.error('🎯 BookController Error Stack:', error.stack);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async getBookById(req, res) {
    try {
      const { id } = req.params;
      const result = await BookService.getBookById(id);
      
      if (result.error) {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la récupération du livre:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async createBook(req, res) {
    try {
      const result = await BookService.createBook(req.body);
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Erreur lors de la création du livre:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async updateBook(req, res) {
    try {
      const { id } = req.params;
      const result = await BookService.updateBook(id, req.body);
      
      if (result.error) {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du livre:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }

  static async deleteBook(req, res) {
    try {
      const { id } = req.params;
      const result = await BookService.deleteBook(id);
      
      if (result.error) {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la suppression du livre:', error);
      res.status(500).json({ error: true, message: "Erreur interne du serveur" });
    }
  }
}

module.exports = BookController;
