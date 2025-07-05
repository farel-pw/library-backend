var mysql = require("mysql");
var connection = require("../../database");

module.exports = async (req, res) => {
  const { id, titre, auteur, genre, isbn, annee_publication, image_url, description, disponible } = req.body;

  if (!id) {
    return res.json({ "Error": true, "Message": "ID du livre requis" });
  }

  let query = `
    UPDATE livres 
    SET titre = ?, auteur = ?, genre = ?, isbn = ?, annee_publication = ?, image_url = ?, description = ?, disponible = ? 
    WHERE id = ?
  `;

  const values = [titre, auteur, genre, isbn, annee_publication, image_url, description, disponible, id];
  query = mysql.format(query, values);

  connection.query(query, function (err, result) {
    if (err) {
      res.json({ "Error": true, "Message": "Erreur lors de la mise à jour du livre" });
    } else {
      res.json({ "Error": false, "Message": "Livre mis à jour avec succès" });
    }
  });
};
