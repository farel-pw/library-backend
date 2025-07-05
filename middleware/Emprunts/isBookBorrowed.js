var mysql = require("mysql");
var connection = require("../../database");

module.exports = function (req, res) {
  const livreId = req.params.id;

  const sql = `
    SELECT * FROM emprunts 
    WHERE livre_id = ? AND rendu = FALSE
  `;

  console.log('Requête SQL :', sql, 'avec id livre :', livreId);

  connection.query(sql, [livreId], function (err, rows) {
    if (err) {
      res.json({ Error: true, Message: "Erreur MySQL : \n" + err });
    } else {
      const isBorrowed = rows.length > 0;
      res.json({
        Error: false,
        Message: isBorrowed
          ? "Le livre est actuellement emprunté"
          : "Le livre est disponible",
        emprunts_en_cours: rows
      });
    }
  });
};
