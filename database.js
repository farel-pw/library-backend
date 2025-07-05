
const mysql = require('mysql2');

const connection = mysql.createConnection({

     host: 'localhost',   
    user: 'root',
    password: '',
    database: 'bibliotheque',
    port: 3306,


    
});

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = connection;
  
