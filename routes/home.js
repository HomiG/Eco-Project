'use strict'
const express = require('express');
var multer = require('multer');
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const router = express.Router();
const connection = require('../config/database.js')
const mysql = require('mysql');
const crypto = require('crypto');
const assert = require('assert');
const doAsync = require('doasync')
const fs = require('fs')
const util = require('util');


const { encrypt, decrypt } = require('../encryptDecrypt');
const { json } = require('express');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(express.json());
router.use(bodyParser());
// router.use(upload())

// router.get('/', function (req, res) {
//   res.render('../views/index.ejs')
// });


var Storage = multer.diskStorage({

  destination: function(req, file, callback) {

      callback(null, "./uploads");

  },

  filename: function(req, file, callback) {

      callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);

  }

});

var upload = multer({

storage: Storage

}).array("Uploader", 1); //Field name and max count

// app.get("/", function(req, res) {

// res.sendFile(__dirname + "/index.ejs");

// });


router.get('/upload', function (req, res) {
  res.render('../views/upload.ejs')
});

router.post("/api/Upload", function(req, res) {

upload(req, res, function(err) {

    if (err) {

        return res.end("Something went wrong!");

    }

    return res.end("File uploaded sucessfully!.");

});});


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











router.get('/', async function (req, res) {


  let jsonData = require('../locationHistory.json')
  //This is for Running the Code Async
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
  const db = makeDb();

 // });


  function bulkInsert(db, table, objectArray) {
    let keys = Object.keys(objectArray[0]);
    if (keys.includes("activity")) { // Checking if 
      keys.pop();
    }
    let values = objectArray.map(obj => keys.map(key => obj[key]));
    let sql = 'INSERT INTO ' + table + ' (' + keys.join(',') + ') VALUES ?';
    return db.query(sql, [values]);
  }

  


  let entryId;
  let activity1Id;
  let activity2Id;

  let i, j, k;


  for (i = 0; i < jsonData.locations.length; i++) {


    entryId = await bulkInsert(db, 'entry', [jsonData.locations[i]])


    console.log("Entry ID: ", entryId.insertId);


    if ('activity' in jsonData.locations[i]) {
      for (j = 0; j < jsonData.locations[i].activity.length; j++) {
        activity1Id = await bulkInsert(db, 'activity1', [jsonData.locations[i].activity[j]])
        //console.log("\tActivity1 ID: ", activity1Id.insertId)
        let insertActivity1ConnectAcitivity2 = db.query('INSERT INTO LocationConnectActivity(`entryId`, `a1`) VALUES(' + entryId.insertId + ',' + activity1Id.insertId + ')')


        if ('activity' in jsonData.locations[i].activity[j]) {
          for (k = 0; k < jsonData.locations[i].activity[j].activity.length; k++) {
            activity2Id = await bulkInsert(db, 'activity2', [jsonData.locations[i].activity[j].activity[k]])
            //console.log("\t\tActivity2 ID: ", activity2Id.insertId)
            let insertActivity1ConnectAcitivity2 = db.query('INSERT INTO Activity1ConnectActivity2(`a1`, `a2`) VALUES(' + activity1Id.insertId + ',' + activity2Id.insertId + ')')

          }
        }
      }
    }

  }
})
module.exports = router;
