const connection = require('../config/database.js')
const mysql = require('mysql');


let jsonData = require('../locationHistory.json');


function bulkInsert(connection, table, objectArray, callback) {
  let keys = Object.keys(objectArray[0]);
  if (keys.includes("activity")) { // Checking if 
    keys.pop();
  }
  let values = objectArray.map(obj => keys.map(key => obj[key]));
  let sql = 'INSERT INTO ' + table + ' (' + keys.join(',') + ') VALUES ?';
  connection.query(sql, [values], function (error, results, fields) {
    if (error) callback(error);
    callback(null, results);
  });
}
let cordinates = [];
let activity1 = [];
let activity2 = [];





// function getCordinatesId(callback){


//   for (i = 0; i < jsonData.locations.length; i++) {
//     bulkInsert(connection, 'entry', [jsonData.locations[i]], function (err, result) {
//       if (err) throw err;

//      entryId = result.insertId // It's the ID (the auto-Incriment from MySql) of the Entry Table
//      return callback(entryId, i)
//     });
//   }
// }



insertCordinatesGetId = function () {
  return new Promise(function (resolve, reject) {
    for (i = 0; i < jsonData.locations.length; i++) {
      bulkInsert(connection, 'entry', [jsonData.locations[i]], function (err, result) {
        if (err) throw err;

        entryId = result.insertId // It's the ID (the auto-Incriment from MySql) of the Entry Table

        if (result === undefined) {
          reject(new Error("Error result is undefined"));
        } else {
          resolve(result);
        }

      });
    }

  }
  )
}

insertCordinatesGetId()
.then(function(results){
  console.log(results.insertId)
})


// for (i = 0; i < jsonData.locations.length; i++) {
//   bulkInsert(connection, 'entry', [jsonData.locations[i]], function (err, result) {
//     if (err) throw err;

//     entryId = result.insertId // It's the ID (the auto-Incriment from MySql) of the Entry Table


//   });
// }


// if ('activity' in jsonData.locations[i]) {
//   for (j = 0; j < jsonData.locations[i].activity.length; j++) {
//     bulkInsert(connection, "activity1", [jsonData.locations[i].activity[j]], function (err, result) {
//       if (err) throw err;
//       activity1Id = result.insertId
//     })
//     connection.query('INSERT INTO LocationConnectActivity(entryId, a1) VALUES(' + entryId + ',' + activity1Id + ')')
//   }

// }
