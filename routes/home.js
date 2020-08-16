const express = require('express');
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const router = express.Router();
const connection = require('../config/database.js')
const mysql = require('mysql');
const crypto = require('crypto');
const assert = require('assert');
const doAsync = require('doasync')
const fs = require('fs')


const { encrypt, decrypt } = require('../encryptDecrypt');
const { json } = require('express');




router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(express.json());
router.use(bodyParser());



router.get('/', function (req, res) {
  res.render('../views/index.ejs')
});


//accepts the username and the password from the user, with the POST method.
//encrypts the password, and sends it back to the user.
router.post('/signup', async function (req, res) {
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    var user = {
      username: req.body.username,
      password: hashedPassword,
      userId: encrypt(req.body.email, req.body.password),
      email: req.body.email
    }


    connection.query("INSERT INTO `user` VALUES(" + "'" + user.username + "'," + "'" + user.password + "'," + "'" + user.userId + "',"
      + "'" + user.email + "')",
      function (err, result) {
        if (err) {

          if (err.code == 'ER_DUP_ENTRY' || err.errno == 1062) {
            res.status(202).send("Dublicate Entry");
          }
          else {
            console.log('Other error in the query')
          }

        } else {
          res.status(201).send("COMPLETE SIGN-UP");
        }
      });
  }

  catch{
    res.status(500)
  }
});

router.post('/login', function (req, res) {



  loginData = {
    email: req.body.email,
    password: req.body.password,
    userId: encrypt(req.body.email, req.body.password)
  }




  connection.query("SELECT userId FROM user WHERE userId= '" + loginData.userId + "'", function (err, result) {
    if (err) throw err;
    if (!result.length) {
      res.status(500).send("You can't Procced, no user Found");
      console.log(result);
    }
    else {
      res.render('../views/main_page.ejs');
      console.log(result)
    }
  });



});

// //check if given password maches saved password
// if(await bcrypt.compare(req.body.password, savedPassword));














// router.get('/', function (req, res) {

//   function bulkInsert(connection, table, objectArray, callback) {
//     let keys = Object.keys(objectArray[0]);
//     if (keys.includes("activity")) { // Checking if 
//       keys.pop();
//     }
//     let values = objectArray.map(obj => keys.map(key => obj[key]));
//     let sql = 'INSERT INTO ' + table + ' (' + keys.join(',') + ') VALUES ?';
//     connection.query(sql, [values], function (error, results, fields) {
//       if (error) callback(error);
//       callback(null, results);
//     });
//   }

//   let jsonData = require('../locationHistory.json');


<<<<<<< HEAD
//   function bulkInsert(con, table, objectArray, callback) {
//     let keys = Object.keys(objectArray[0]);
//     if (keys.includes("activity")) { // Checking if 
//       keys.pop();
//     }
//     let values = objectArray.map(obj => keys.map(key => obj[key]));
//     let sql = 'INSERT INTO ' + table + ' (' + keys.join(',') + ') VALUES ?';
//     con.query(sql, [values], function (error, results, fields) {
//       if (error) callback(error);
//       callback(null, results);
//     });
//   }

//   let cordinates = [];
//   let activity1 = [];
//   let activity2 = [];



// for (i = 0; i < jsonData.locations.length; i++) {
//     bulkInsert(connection, 'entry', [jsonData.locations[i]], function (err, result) {
//       (error, response) => {
//         if (error) res.send(error);
//         res.json(response);
//       }
//     });
// //  if('activity' in  jsonData.locations[i]) {
// //     for(j=0; j < jsonData.locations[i].activity.length; j++){
// //         // console.log('i= ' + i + ' j= ' + j );
// //         // console.log(jsonData.locations[i])
// //         cordinates.push([jsonData.locations[i].timestampMs, jsonData.locations[i].latitudeE7, 
// //             jsonData.locations[i].longitudeE7, jsonData.locations[i].accuracy])
// //         if('activity' in  jsonData.locations[i].activity[j]) {
                        
// //             for(k=0; k < jsonData.locations[i].activity[j].length; k++){
                
// //             }
// //         }
// //     }
// //   }
// //   else
// //     continue;
// }
=======
  let cordinates = [];
  let activity1 = [];
  let activity2 = [];

  var entryId;
  var activity1Id;
  let activity2Id;


  var troll

  function getTheValue(result){
    console.log("Get The Value: ", result);
    troll = result
    return result
  }

  console.log("Troll:", troll); 

  for (i = 0; i < jsonData.locations.length; i++) {
    bulkInsert(connection, 'entry', [jsonData.locations[i]], function (err, result) {
      if (err) throw err;

     entryId = result.insertId // It's the ID (the auto-Incriment from MySql) of the Entry Table
     getTheValue(entryId)
     console.log("Inside: " + entryId)
    });
    console.log("Outside: " + entryId)
    console.log("Troll:", troll); 

    if ('activity' in jsonData.locations[i]) {
      for (j = 0; j < jsonData.locations[i].activity.length; j++) {
        //console.log('i= ' + i + ' j= ' + j );
        bulkInsert(connection, "activity1", [jsonData.locations[i].activity[j]], function (err, result) {
          if (err) throw err;
         activity1Id = result.insertId
          //console.log(activity1Id)
        })
        //console.log(entryId, "   ", activity1Id);
        //connection.query('INSERT INTO LocationConnectActivity(entryId, a1) VALUES(' + entryId + ',' + activity1Id + ')')
      }

    }
  }
>>>>>>> ffd5eeb60c4e4ccc3d8be3e72096c2780e2be812


// })


module.exports = router;
