var mysql = require("mysql");
var connection = require("../../database");

const findBookReservation = async (req, res) => {
  try {
    let query = "SELECT * FROM ??";
    let table = ["reservations"];
    query = mysql.format(query, table);

    connection.query(query, function (err, rows) {
      if (err) {
        res.json({ Error: true, Message: "Erreur lors de la requête MySQL" });
      } else {
        res.json({ Error: false, Message: "Succès", Reservations: rows });
      }
    });
  } catch (error) {
    res.json({ Error: true, Message: error });
  }
};

module.exports = findBookReservation;
