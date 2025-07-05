const mysql = require('mysql2');
const config = require('./index');

const connection = mysql.createConnection(config.database);

connection.connect(function(err) {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
        throw err;
    }
    console.log('Connexion à la base de données établie');
});

module.exports = connection;
