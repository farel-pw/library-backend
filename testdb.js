
const mysql = require('mysql2');

const connection = mysql.createConnection({

     host: 'localhost',   
    user: 'root',
    password: '',
    database: 'bibliotheque',
    port: 3306,


    
});
connection.connect(function(err) {
  if (err) {
    console.error("Erreur de connexion à MySQL :", err); // affiche tout l'objet erreur
    process.exit(1);
  } else {
    console.log('Connecté à MySQL avec succès !');
    connection.end();
  }
});