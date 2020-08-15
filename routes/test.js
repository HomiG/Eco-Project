const connection = require('../config/database.js')
const mysql = require('mysql');


let jsonData = require('../locationHistory.json');


function bulkInsert(con, table, objectArray, callback) {
  let keys = Object.keys(objectArray[0]);
  if (keys.includes("activity")) { // Checking if 
    keys.pop();
  }
  let values = objectArray.map(obj => keys.map(key => obj[key]));
  let sql = 'INSERT INTO ' + table + ' (' + keys.join(',') + ') VALUES ?';
  con.query(sql, [values], function (error, results, fields) {
    if (error) callback(error);
    callback(null, results);
  });
}

let cordinates = [];
let activity1 = [];
let activity2 = [];



for (i = 0; i < jsonData.locations.length; i++) {
  bulkInsert(connection, 'entry', [jsonData.locations[i]], function (err, result) {
    if (err) {
        console.log(1);
    }
  });
//  if('activity' in  jsonData.locations[i]) {
//     for(j=0; j < jsonData.locations[i].activity.length; j++){
//         // console.log('i= ' + i + ' j= ' + j );
//         // console.log(jsonData.locations[i])
//         cordinates.push([jsonData.locations[i].timestampMs, jsonData.locations[i].latitudeE7, 
//             jsonData.locations[i].longitudeE7, jsonData.locations[i].accuracy])
//         if('activity' in  jsonData.locations[i].activity[j]) {
                      
//             for(k=0; k < jsonData.locations[i].activity[j].length; k++){
              
//             }
//         }
//     }
//   }
//   else
//     continue;
}

