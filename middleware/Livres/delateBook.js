var mysql = require("mysql");
var connection = require("../../database");

module.exports = async (req, res) => {
  const { id } = req.params;

  // 🔐 Vérification rôle admin
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ "Error": true, "Message": "Accès refusé : réservé aux administrateurs" });
  }

  if (!id) {
    return res.json({ "Error": true, "Message": "ID livre requis" });
  }

  let query = `DELETE FROM livres WHERE id = ?`;
  query = mysql.format(query, [id]);

  connection.query(query, function(err, result) {
    if (err) {
      res.json({ "Error": true, "Message": "Erreur lors de la suppression du livre" });
    } else {
      res.json({ "Error": false, "Message": "Livre supprimé avec succès" });
    }
  });
};
