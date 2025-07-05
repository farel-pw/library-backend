var mysql = require("mysql");
var connection = require("../../database");

module.exports = function (req, res) {
  //  Contrôle du rôle
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ Error: true, Message: "Accès interdit : réservé aux administrateurs" });
  }

  const id = req.params.id;
  const sql = 'SELECT * FROM emprunts WHERE utilisateur_id = ?';

  console.log('Requête SQL :', sql, 'avec id utilisateur :', id);

  connection.query(sql, [id], function (err, rows) {
    if (err) {
      res.json({ Error: true, Message: "Erreur MySQL : \n" + err });
    } else {
      res.json({
        Error: false,
        Message: rows.length > 0
          ? `Emprunts trouvés pour l'utilisateur id = ${id}`
          : "Aucun emprunt trouvé",
        data: rows
      });
    }
  });
};
