var express = require("express");
var mysql   = require("mysql");
var cors = require('cors');
var bodyParser  = require("body-parser");



var verifyToken = require('./middleware/Utilisateurs/verifyToken');
var addNewUser = require('./middleware/Utilisateurs/addNewUser');
var userLoginCheck = require('./middleware/Utilisateurs/userLoginCheck');
const findAllUsers = require('./middleware/Utilisateurs/findAllUsers');


var welcome = require('./middleware/Utilisateurs/welcome');
 var Utilisateur = require('./middleware/Utilisateurs/Data/Utilisateur');
 var Delate = require('./middleware/Utilisateurs/Data/Delate');
 var Update = require('./middleware/Utilisateurs/Data/Update');
 var UserOne = require('./middleware/Utilisateurs/UserOne');
 
// Livre
var addBook = require('./middleware/Livres/addBook');
var deleteBook = require('./middleware/Livres/delateBook');
var findBook = require('./middleware/Livres/findBook');
var updateBook = require('./middleware/Livres/updateBook');

// Emprunt
var createBorrow = require('./middleware/Emprunts/createBorrow');
var findAllBorrowWithDetails = require('./middleware/Emprunts/findAllWithDetails');
var findBorrowByUser = require('./middleware/Emprunts/findBorrowByUser');
var findBorrowUserNoReturn = require('./middleware/Emprunts/findBorrowUserNoReturn');
var isBookBorrowed = require('./middleware/Emprunts/isBookBorrowed');
var returnBorrow = require('./middleware/Emprunts/returnBorrow');
var findReturnBorrow = require('./middleware/Emprunts/returnBorrow');

// Reservation
var createReservation = require('./middleware/Reservations/createReservation');
var deleteReservation = require('./middleware/Reservations/deleteReservation');
var findBookReservation = require('./middleware/Reservations/findBookReservation');
var findReservationByUser = require('./middleware/Reservations/findReservationByUser');

// Commentaire
var createComment = require('./middleware/Commentaires/createComment');
var deleteComment = require('./middleware/Commentaires/deleteComment');
var commentByBook = require('./middleware/Commentaires/commentByBook');
var updateNote = require('./middleware/Commentaires/note');

const port = process.env.PORT || 4000;   

  
////  Routes  principales  

var app  = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', welcome);
app.post('/signup', addNewUser);
app.post('/userlogin', userLoginCheck);
app.get('/livres', findBook);
app.get('/commentaires/livre/:id', commentByBook);
app.get('/emprunts/est-emprunte/:id', isBookBorrowed);
// app.get('/Utilisateur', Utilisateur);

////  Sous-Routes avec Token

var apiRoutes = express.Router();
apiRoutes.use(bodyParser.urlencoded({ extended: true }));
apiRoutes.use(bodyParser.json());


// Utilisateurs
apiRoutes.use(verifyToken);
apiRoutes.get('/Utilisateur', Utilisateur);
apiRoutes.get('/UserOne/:id', UserOne);
apiRoutes.delete('/Delate/:id', Delate);
apiRoutes.put('/Update', Update);
apiRoutes.get('/utilisateurs', findAllUsers);


// Livres 
apiRoutes.post('/livres', addBook);
apiRoutes.put('/livres', updateBook);
apiRoutes.delete('/livres/:id', deleteBook);

// Emprunts
apiRoutes.post('/emprunts', createBorrow);
apiRoutes.get('/emprunts/details', findAllBorrowWithDetails);
apiRoutes.get('/emprunts/utilisateur/:id', findBorrowByUser);
apiRoutes.get('/emprunts/utilisateur/:id/non-rendus', findBorrowUserNoReturn);
apiRoutes.get('/emprunts/rendus', findReturnBorrow);
apiRoutes.put('/emprunts/retour/:id', returnBorrow);

// Réservations
apiRoutes.post('/reservations', createReservation);
apiRoutes.get('/reservations/livre', findBookReservation);
apiRoutes.get('/reservations/utilisateur/:id', findReservationByUser);
apiRoutes.delete('/reservations/:id', deleteReservation);

// Commentaires
apiRoutes.post('/commentaires', createComment);
apiRoutes.put('/commentaires/note', updateNote);
apiRoutes.delete('/commentaires/:id', deleteComment);


app.use('/api', apiRoutes);

app.listen( port , () => {
    console.log('Démarrage et écoute sur le port  ' +port);
});
