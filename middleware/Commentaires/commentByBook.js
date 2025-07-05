var mysql = require("mysql");
var connection = require("../../database");

module.exports = function (req, res) {
  const id = req.params.id;
  const sql = 'SELECT * FROM commentaires WHERE livre_id = ?';

  console.log('Requête SQL :', sql, 'avec id livre :', id);

  connection.query(sql, [id], function (err, rows) {
    if (err) {
      res.json({ Error: true, Message: "Erreur MySQL : \n" + err });
    } else {
      res.json({
        Error: false,
        Message: rows.length > 0
          ? `Commentaires trouvés pour le livre id = ${id}`
          : "Aucun commentaire trouvé pour ce livre",
        data: rows
      });
    }
  });
};
