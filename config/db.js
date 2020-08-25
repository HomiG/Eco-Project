
  const connection = require('./database.js')
  const mysql = require('mysql');
  const util = require('util');


  function makeDb() {
    var connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: '',
      database: 'ecoproject',
      port: 3306
    });
    return {
      query(sql, args) {
        return util.promisify(connection.query)
          .call(connection, sql, args);
      },
      close() {
        return util.promisify(connection.end).call(connection);
      }
    };
  }
  //This is for Running the Code Async
  const db = makeDb();

module.exports = makeDb;