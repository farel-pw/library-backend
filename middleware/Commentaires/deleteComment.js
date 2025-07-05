var mysql = require("mysql");
var connection = require("../../database");

module.exports = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.json({ "Error": true, "Message": "ID commentaire requis" });
  }

  let query = `DELETE FROM commentaires WHERE id = ?`;
  query = mysql.format(query, [id]);

  connection.query(query, function(err, result) {
    if (err) {
      res.json({ "Error": true, "Message": "Erreur lors de la suppression du commentaire" });
    } else {
      res.json({ "Error": false, "Message": "Commentaire supprimé avec succès" });
    }
  });
};
