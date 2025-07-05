var mysql = require("mysql");
var connection = require("../../../database");

module.exports = async (req, res) => {
  const { id, nom, prenom , email, telephone, } = req.body;
  
  if (!id) {
    return res.json({"Error": true, "Message": "ID utilisateur requis"});
  }
  
  let query = `UPDATE utilisateurs SET nom = ?, prenom = ? , email = ? Telephone = ? WHERE id = ?`;
  query = mysql.format(query, [nom, prenom , email, telephone, id]);
  
  connection.query(query, function(err, result) {
    if(err) {
      res.json({"Error": true, "Message": "Error executing MySQL query"});
    } else {
      res.json({"Error": false, "Message": "Utilisateur mis à jour avec succès"});
    }
  });
};