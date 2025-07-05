var mysql = require("mysql");
var connection = require("../../database");

module.exports = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.json({ "Error": true, "Message": "ID réservation requis" });
  }

  let query = `DELETE FROM reservations WHERE id = ?`;
  query = mysql.format(query, [id]);

  connection.query(query, function(err, result) {
    if (err) {
      res.json({ "Error": true, "Message": "Erreur lors de la suppression" });
    } else {
      res.json({ "Error": false, "Message": "Réservation supprimée avec succès" });
    }
  });
};
