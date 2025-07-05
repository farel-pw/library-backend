const mysql = require("mysql2");
const connection = require("../../database");

const createBorrow = async (req, res, next) => {
  try {
    const post = {
      utilisateur_id: req.body.utilisateur_id,
      livre_id: req.body.livre_id,
      date_emprunt: req.body.date_emprunt,
      date_retour_prevue: req.body.date_retour_prevue,
      date_retour_effective: null,
      rendu: false
    };

    console.log("Nouvel emprunt :", post);

    const query = "INSERT INTO ?? SET ?";
    const table = ["emprunts"];
    const formatted = mysql.format(query, table);

    connection.query(formatted, post, function (err, result) {
      if (err) {
        return res.json({ Error: true, Message: "Erreur lors de l'enregistrement de l'emprunt" });
      } else {
        return res.json({ Error: false, Message: "Emprunt enregistré avec succès", id: result.insertId });
      }
    });

  } catch (error) {
    console.error("Erreur :", error);
    res.status(500).json({ Error: true, Message: error.message });
  }
};

module.exports = createBorrow;
