const mysql = require("mysql2");
const connection = require("../../database");

const addBook = async (req, res, next) => {
  try {

    // Vérifie si l'utilisateur est authentifié et a le rôle d'administrateur
     if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ Error: true, Message: "Accès refusé : réservé aux administrateurs" });
    }

    const post = {
      titre: req.body.titre,
      auteur: req.body.auteur,
      genre: req.body.genre || null,
      isbn: req.body.isbn,
      annee_publication: req.body.annee_publication || null,
      image_url: req.body.image_url || null,
      description: req.body.description || null,
      disponible: req.body.disponible !== undefined ? req.body.disponible : 1
    };

    console.log("Nouveau livre à insérer :", post);

    // Vérifie si le livre avec cet ISBN existe déjà
    let query = "SELECT isbn FROM ?? WHERE ?? = ?";
    let table = ["livres", "isbn", post.isbn];
    query = mysql.format(query, table);

    connection.query(query, function (err, rows) {
      if (err) {
        return res.json({ Error: true, Message: "Erreur lors de la vérification ISBN" });
      }

      if (rows.length === 0) {
        // Insertion du livre
        let insertQuery = "INSERT INTO ?? SET ?";
        let insertTable = ["livres"];
        insertQuery = mysql.format(insertQuery, insertTable);

        connection.query(insertQuery, post, function (err, result) {
          if (err) {
            return res.json({ Error: true, Message: "Erreur lors de l'insertion du livre" });
          } else {
            return res.json({ Error: false, Message: "Livre ajouté avec succès", id: result.insertId });
          }
        });

      } else {
        return res.json({ Error: false, Message: "Un livre avec cet ISBN existe déjà" });
      }
    });

  } catch (error) {
    console.error("Erreur :", error);
    return res.status(500).json({ Error: true, Message: error.message });
  }
};

module.exports = addBook;
