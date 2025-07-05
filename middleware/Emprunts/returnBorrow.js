var mysql = require("mysql");
var connection = require("../../database");

module.exports = function (req, res) {
  //  Accès admin uniquement
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ Error: true, Message: "Accès interdit : réservé aux administrateurs" });
  }

  const sql = `
    SELECT * FROM emprunts 
    WHERE rendu = TRUE
  `;

  console.log('Requête SQL :', sql);

  connection.query(sql, function (err, rows) {
    if (err) {
      res.json({ Error: true, Message: "Erreur MySQL : \n" + err });
    } else {
      res.json({
        Error: false,
        Message: rows.length > 0
          ? "Emprunts rendus trouvés"
          : "Aucun emprunt rendu trouvé",
        data: rows
      });
    }
  });
};
