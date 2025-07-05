const mysql = require("mysql2");
const connection = require("../../database");

const createReservation = async (req, res, next) => {
  try {
    const post = {
      utilisateur_id: req.body.utilisateur_id,
      livre_id: req.body.livre_id,
      date_reservation: new Date(),
      statut: req.body.statut || "en_attente"
    };

    console.log("Nouvelle réservation :", post);

    const query = "INSERT INTO ?? SET ?";
    const table = ["reservations"];
    const formatted = mysql.format(query, table);

    connection.query(formatted, post, function (err, result) {
      if (err) {
        return res.json({ Error: true, Message: "Erreur lors de la réservation" });
      } else {
        return res.json({ Error: false, Message: "Réservation enregistrée avec succès", id: result.insertId });
      }
    });

  } catch (error) {
    console.error("Erreur :", error);
    res.status(500).json({ Error: true, Message: error.message });
  }
};

module.exports = createReservation;
