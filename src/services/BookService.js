const Book = require('../models/Book');

class BookService {
  static async getAllBooks() {
    try {
      console.log("📚 BookService: Starting getAllBooks");
      const books = await Book.findAll();
      console.log("📚 BookService: Books retrieved successfully, count:", books.length);
      return { error: false, data: books };
    } catch (error) {
      console.error('📚 BookService Error:', error);
      console.error('📚 BookService Error Stack:', error.stack);
      return { error: true, message: "Error fetching books" };
    }
  }

  static async getBookById(id) {
    try {
      const book = await Book.findById(id);
      if (!book) {
        return { error: true, message: "Book not found" };
      }
      return { error: false, data: book };
    } catch (error) {
      console.error('Erreur lors de la récupération du livre:', error);
      return { error: true, message: "Error fetching book" };
    }
  }

  static async createBook(bookData) {
    try {
      // Vérifier si l'ISBN existe déjà
      const existingBooks = await Book.findByIsbn(bookData.isbn);
      if (existingBooks.length > 0) {
        return { error: false, message: "Un livre avec cet ISBN existe déjà" };
      }

      const newBook = {
        titre: bookData.titre,
        auteur: bookData.auteur,
        genre: bookData.genre || null,
        isbn: bookData.isbn,
        annee_publication: bookData.annee_publication || null,
        image_url: bookData.image_url || null,
        description: bookData.description || null,
        disponible: bookData.disponible !== undefined ? bookData.disponible : 1
      };

      const result = await Book.create(newBook);
      return { error: false, message: "Livre ajouté avec succès", id: result.insertId };
    } catch (error) {
      console.error('Erreur lors de la création du livre:', error);
      return { error: true, message: "Error creating book" };
    }
  }

  static async updateBook(id, bookData) {
    try {
      // Filtrer les champs autorisés pour éviter les erreurs SQL
      const allowedFields = [
        'titre', 'auteur', 'genre', 'isbn', 'annee_publication', 
        'image_url', 'description', 'disponible'
      ];
      
      const filteredData = {};
      Object.keys(bookData).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredData[key] = bookData[key];
        } else {
          console.log(`⚠️ Champ ignoré: ${key} = ${bookData[key]}`);
        }
      });

      console.log('📖 Données d\'origine:', bookData);
      console.log('📖 Données filtrées pour la mise à jour:', filteredData);
      
      const result = await Book.update(id, filteredData);
      
      if (result.affectedRows === 0) {
        return { error: true, message: "Book not found" };
      }
      
      return { error: false, message: "Livre mis à jour avec succès" };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du livre:', error);
      console.error('Stack trace:', error.stack);
      return { error: true, message: "Error updating book" };
    }
  }

  static async deleteBook(id) {
    try {
      const result = await Book.delete(id);
      if (result.affectedRows === 0) {
        return { error: true, message: "Book not found" };
      }
      return { error: false, message: "Livre supprimé avec succès" };
    } catch (error) {
      console.error('Erreur lors de la suppression du livre:', error);
      return { error: true, message: "Error deleting book" };
    }
  }
}

module.exports = BookService;
