var mysql = require("mysql");
var connection = require("../../database");

const findAllBorrowWithDetail = async (req, res) => {
  try {
    let query = `
      SELECT 
        e.id AS emprunt_id,
        u.nom AS utilisateur_nom,
        u.prenom AS utilisateur_prenom,
        l.titre AS livre_titre,
        e.date_emprunt,
        e.date_retour_prevue,
        e.date_retour_effective,
        e.rendu
      FROM emprunts e
      JOIN utilisateurs u ON e.utilisateur_id = u.id
      JOIN livres l ON e.livre_id = l.id
    `;

    connection.query(query, function (err, rows) {
      if (err) {
        res.json({ Error: true, Message: "Erreur lors de la requête MySQL" });
      } else {
        res.json({ Error: false, Message: "Succès", Emprunts: rows });
      }
    });
  } catch (error) {
    res.json({ Error: true, Message: error });
  }
};

module.exports = findAllBorrowWithDetail;
