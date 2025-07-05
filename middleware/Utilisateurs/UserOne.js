

// var mysql = require("mysql");
// var connection = require("../database");
// // const log = require('log-to-file');


// module.exports=function(req, res) {

//  const ID = req.params.id
//  const idetudiant = req.params.id

//    let post = {
// 	  id: +ID,        // parseInt( ID )
//   };


//   const sql = 'SELECT * FROM `utilisateurs` WHERE id = ?';


// console.log( sql )
// connection.query(sql,  [id] , function(err,rows){
//     if(err) {
  
//         res.json({"Error" : true, "Message" : "Error executing MySQL query \n" + err });
//     } else {

//                 //    res.send({  
//                 //     Error: false,
//                 //     Message: "Affichage avec succes  id =  " + ID ,
//                 //     donnees: rows[0],
//                 //   });
//                     res.send(rows);

                  
//     }
// });



// };

var mysql = require("mysql");
var connection = require("../../database");

module.exports = function(req, res) {
  const id = req.params.id; // Simplifié en une seule variable

  const sql = 'SELECT * FROM `utilisateurs` WHERE id = ?';

  console.log('Requête SQL :', sql, 'avec id :', id);
  connection.query(sql, [id], function(err, rows) {
    if (err) {
      res.json({ "Error": true, "Message": "Error executing MySQL query \n" + err });
    } else {
      res.json({
        Error: false,
        Message: rows.length > 0 ? `Utilisateurs trouvé avec id = ${id}` : "Aucun utilisateurs trouvé",
        data: rows[0] || null,
      });
    }
  });
};

