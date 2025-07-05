var mysql = require("mysql");
var connection = require("../../../database");

module.exports = async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.json({"Error": true, "Message": "ID utilisateur requis"});
  }
  
  let query = `DELETE FROM utilisateurs WHERE id = ?`;
  query = mysql.format(query, [id]);
  
  connection.query(query, function(err, result) {
    if(err) {
      res.json({"Error": true, "Message": "Error executing MySQL query"});
    } else {
      res.json({"Error": false, "Message": "Utilisateur supprimé avec succès"});
    }
  });
};