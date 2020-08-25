var mysql = require('mysql');
const util = require( 'util' );

var connection  = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: '',
  database: 'ecoproject',
  port: 3306
});


connection.connect(function(err) {
  if (err) throw err;
});




module.exports = connection;