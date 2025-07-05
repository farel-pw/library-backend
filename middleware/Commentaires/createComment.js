const mysql = require("mysql2");
const connection = require("../../database");

const createComment = async (req, res, next) => {
  try {
    const post = {
      utilisateur_id: req.body.utilisateur_id,
      livre_id: req.body.livre_id,
      note: req.body.note,
      commentaire: req.body.commentaire,
      date_publication: new Date()
    };

    if (post.note < 1 || post.note > 5) {
      return res.status(400).json({ Error: true, Message: "La note doit être comprise entre 1 et 5" });
    }

    console.log("Nouveau commentaire :", post);

    const query = "INSERT INTO ?? SET ?";
    const table = ["commentaires"];
    const formatted = mysql.format(query, table);

    connection.query(formatted, post, function (err, result) {
      if (err) {
        return res.json({ Error: true, Message: "Erreur lors de l'enregistrement du commentaire" });
      } else {
        return res.json({ Error: false, Message: "Commentaire ajouté avec succès", id: result.insertId });
      }
    });

  } catch (error) {
    console.error("Erreur :", error);
    res.status(500).json({ Error: true, Message: error.message });
  }
};

module.exports = createComment;
