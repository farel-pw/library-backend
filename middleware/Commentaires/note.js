var mysql = require("mysql");
var connection = require("../../database");

module.exports = async (req, res) => {
  const { id, note } = req.body;

  if (!id) {
    return res.json({ Error: true, Message: "ID du commentaire requis" });
  }

  if (note === undefined || note < 1 || note > 5) {
    return res.json({ Error: true, Message: "Note invalide, elle doit être entre 1 et 5" });
  }

  let query = `UPDATE commentaires SET note = ? WHERE id = ?`;
  query = mysql.format(query, [note, id]);

  connection.query(query, function (err, result) {
    if (err) {
      res.json({ Error: true, Message: "Erreur lors de la mise à jour de la note" });
    } else {
      res.json({ Error: false, Message: "Note mise à jour avec succès" });
    }
  });
};
