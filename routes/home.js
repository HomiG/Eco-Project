'use strict'
const GeoPoint = require('geopoint')
const { inRangeOfRect, geopointToMyPoint } = require('../public/js/myGeographicalModules')

const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require("path")
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const router = express.Router();
const connection = require('../config/database.js')
const mysql = require('mysql');
const crypto = require('crypto');
const assert = require('assert');
const doAsync = require('doasync')
const fs = require('fs');
const ejs = require('ejs');
const util = require('util');

const upload = require('express-fileupload')

const { encrypt, decrypt } = require('../public/js/encryptDecrypt');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(express.json());
router.use(bodyParser());
router.use(upload())


router.use(session({secret: 'ssshhhhh'}));
var sess;
// router.post("/api/Upload", function (req, res) {

//   if (req.files) {
//     console.log(req.files)
//     var file = req.files.file;
//     var filename = file.name;
//     console.log(filename);
//     file.mv('./uploads/' + filename, function (err) {
//       if (err) {
//         res.send(err)
//       }
//       else {
//         //fs.unlinkSync('./uploads/' + filename); 
//         res.status(200).send("File Uploaded")
//       }
//     })
//   }

//});




router.get('/', function (req, res) {
  res.render('../views/index.ejs')
});


router.get('/upload', checkAuth,function (req, res) {
  res.render('../views/upload.ejs')
});



//accepts the username and the password from the user, with the POST method.
//encrypts the password, and sends it back to the user.
router.post('/signup', async function (req, res) {
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    var user = {
      firstname:req.body.firstname,
      lastname: req.body.lastname,
      username: req.body.firstname + ' '+ req.body.lastname,
      password: hashedPassword,
      userId: encrypt(req.body.email, req.body.password),
      email: req.body.email
      
    }
    console.log(user);
    connection.query("INSERT INTO `user` VALUES( " + "'" + user.username + "'," + "'" + user.password + "'," + "'" + user.userId + "',"
      + "'" + user.email + "', 0)",
      function (err, result) {
        if (err) {

          if (err.code == 'ER_DUP_ENTRY' || err.errno == 1062) {
            res.status(202).send("Dublicate Entry");
          }
          else {
            console.log(err.code)
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
  var userObject={
    username: '',
    email: '',
    userId: 0,
    ecoscore:0
  }


function checkAuth(req, res, next) {
  if (!req.session.userId) {
    res.send('You are not logged in, please login first in order to view this page');
  } else {
    next();
  }
}

router.post('/login', function (req, res) {

  
  let loginData = {
    email: req.body.email,
    password: req.body.password,
    userId: encrypt(req.body.email, req.body.password)
  }

  sess=req.session;
  sess.userId=loginData.userId;
  


  connection.query("SELECT userId, username FROM user WHERE userId= '" + loginData.userId + "'", function (err, result) {
    if (err) throw err;
    if (!result.length) {
      res.status(500).send("You can't Procced, no user Found");
      console.log(result);
    }
    else {
      
      
      console.log(result[0].username)
      userObject.username=result[0].username;
      userObject.userId=loginData.userId;
      userObject.email=loginData.email;
      console.log(userObject.userId);
      res.redirect('/mainpage');
    }
  });



});


router.get('/mainPage', checkAuth,function (req, res) {
  res.render('../views/main_page.ejs',{x:userObject.username})
});


router.post('/uploadJson', function (req, res) {

  
  console.log("Entered api/pupload.")



  if (req.files) {
    var file = req.files.file;
    var filename = '1.json';
    console.log(filename);
    //File Gets Overwriten 
    file.mv('./public/uploads/' + filename, function (err) {
      if (err) {
        res.send(err)
      }
      else{
        res.send('File uploaded!');
      }
    })
  } 

})



// //check if given password maches saved password
// if(await bcrypt.compare(req.body.password, savedPassword));

router.get('/ecocharts', /*checkAuth,*/ function(req,res){
  var result;
  var hey1,hey2;
  var ecoscore;
  function calc_ecoscore(callback){
  connection.query("SELECT SUM(confidence) as walking FROM entry INNER JOIN locationconnectactivity on entry.entryId=locationconnectactivity.entryId INNER JOIN activity1 on activity1.aa1=locationconnectactivity.a1 INNER JOIN activity1connectactivity2 on activity1.aa1=activity1connectactivity2.a1 INNER JOIN activity2 on activity2.aa2=activity1connectactivity2.a2  WHERE type= 'ON_FEET' OR type='ON_BICYCLE' AND entry.userId='"+ userObject.userId +"'", function (err, result) {
    if (err) throw err;
    if (!result.length) {
      res.status(500).send("You can't Proceed, no user Found");
      console.log(result);
    }
    else {
      hey1=result[0].walking;
      console.log(result);}
      


    });
    connection.query("SELECT SUM(confidence) as vehicle FROM entry INNER JOIN locationconnectactivity on entry.entryId=locationconnectactivity.entryId INNER JOIN activity1 on activity1.aa1=locationconnectactivity.a1 INNER JOIN activity1connectactivity2 on activity1.aa1=activity1connectactivity2.a1 INNER JOIN activity2 on activity2.aa2=activity1connectactivity2.a2  WHERE type= 'IN_VEHICLE' AND entry.userId='"+ userObject.userId +"'", function (err, result) {
      if (err) throw err;
      if (!result.length) {
        res.status(500).send("You can't Proceed, no user Found");
        console.log(result);
      }
      else {
        hey2=result[0].vehicle;
        console.log(result);}
        
  
  
      });
      var f=hey1/(hey1+hey2)*100;
      callback(f );}

      calc_ecoscore(function(y){
        ecoscore=y;
        console.log(y);
      })
      
    res.render('../views/ecocharts.ejs', {y:ecoscore});
  });


  router.get('/charts', /*checkAuth,*/ function(req,res){
    res.render('../views/ecocharts.ejs')
  });

router.post('/upload',checkAuth, function (req, res) {
  console.log(req.files)
  res.send("DONE")

})


// router.post('/troll', checkAuth, function (req, res) {



//   var sensitiveRect = {
//     _northEastLat: req.body._northEastLat,
//     _northEastLng: req.body._northEastLng,
//     _southWestLat: req.body._southWestLat,
//     _southWestLng: req.body._southWestLng
//   }

//   let patrasCenter = new GeoPoint(38.230462, 21.753150);

//   var point = geopointToMyPoint(patrasCenter)
//   console.log("Patras center is : ", point);

//   if (inRangeOfRect(sensitiveRect, point)) {
//     console.log("IS INSIDE")
//   }
//   else
//     console.log("NOT INSIDE")

//   console.log(sensitiveRect)

// })




router.get('/troll', async function (req, res) {

  // Sensitive Rectangular sent with the Ajax Post 
  var sensitiveRect = {
    _northEastLat: req.body._northEastLat,
    _northEastLng: req.body._northEastLng,
    _southWestLat: req.body._southWestLat,
    _southWestLng: req.body._southWestLng
  }

 
  

    


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


  function bulkInsert(db, table, objectArray) {
    let keys = Object.keys(objectArray[0]);
    if (keys.includes("activity")) { // Checking if 
      keys.splice(keys.indexOf('activity'),1);
    }
    let values = objectArray.map(obj => keys.map(key => obj[key]));
    let sql = 'INSERT INTO ' + table + ' (' + keys.join(',') + ') VALUES ?';
    return db.query(sql, [values]);
  }

  var user={
    _id: null,
    _data: null,
    createUser: function(id,data){
      this._id=id;
      this._data=data;
    }

  }
 
var userArray=[];
//userArray.push(new user.createUser('07b04ece12bb92f3ccd70e07d0c0741ded0eeee605db11171f20d85d40ab9461',require('../Data/Doug/Location History.json')));
// userArray.push(new user.createUser('0a67a1689bfd43a6d940e9a5ff12cda762b3ef30c952fd097ca39deb6216e93f',require('../Data/Paros/Loc_History.json')));
// userArray.push(new user.createUser('0a67a1689bfd43a6d940e9a5ff12cda762b3ef30c952fd097ca39deb6216e93f',require('../Data/Paros/Istoriko.json')));
// userArray.push(new user.createUser('915aa500f53a47939496877e265227ad743222b4b5176856bd4a315f9c030fd2',require('../Data/Lee/locationHistory.json')));
// userArray.push(new user.createUser('d24aa26db1bcb7b2b10e9fcc0d59025f9f892c34d89775d1f88cc7ffdb563826',require('../Data/Mimi Brown/Location History(chris).json')));
// userArray.push(new user.createUser('d24aa26db1bcb7b2b10e9fcc0d59025f9f892c34d89775d1f88cc7ffdb563826',require('../Data/Mimi Brown/Ιστορικό τοποθεσίας(georgia).json')));
// userArray.push(new user.createUser('d24aa26db1bcb7b2b10e9fcc0d59025f9f892c34d89775d1f88cc7ffdb563826',require('../Data/Mimi Brown/Ιστορικό τοποθεσίας(vagg).json')));
//userArray.push(new user.createUser('fe1f5a595fa60f4218ca5f9b05c806c57e5f419837b153bc641edd53e505997b',require('../Data/Tamila/Location History.json')));

// let h;
// for(h=0; h<userArray.length; h++){
//   userArray[h]._data.locations.forEach(v => {v.userId = userArray[h]._id;});

// }
  
  let entryId;
  let activity1Id;
  let activity2Id;

  let i, j, k, n;

  let patrasCenter = new GeoPoint(38.230462, 21.753150);
  let pointToBeInserted;

  // Checking Sensitive Rectangular
  let upperleftBound;
  let lowerDownBound;
  let insertedPoint


 for(n=0; n<userArray.length; n++){
  //userArray[n]._data.locations.forEach(v => {v.userId = userArray[n]._id;}); 
  for (i = 0; i < userArray[n]._data.locations.length; i++) {

    
    pointToBeInserted = new GeoPoint(userArray[n]._data.locations[i].latitudeE7 * (Math.pow(10, -7)),
      userArray[n]._data.locations[i].longitudeE7 * (Math.pow(10, -7)));

    // If the point to be inserted out of 10Km Patras Cetner, Skip this Spot
    if (patrasCenter.distanceTo(pointToBeInserted, true) > 10) {
      //console.log("Out Of Patras")
      continue;
    }

    // If point is inside the sensitive Area, Skip This Point
    if (inRangeOfRect(sensitiveRect, geopointToMyPoint(pointToBeInserted))) {
      //console.log("POINT IS INSIDE SENSITIVE AREA ")
      continue;
    }
    userArray[n]._data.locations[i].userId=userArray[n]._id;
    entryId = await bulkInsert(db, 'entry', [userArray[n]._data.locations[i]])


    //console.log("Entry ID: ", entryId.insertId);


    if ('activity' in userArray[n]._data.locations[i]) {
      for (j = 0; j < userArray[n]._data.locations[i].activity.length; j++) {
        activity1Id = await bulkInsert(db, 'activity1', [userArray[n]._data.locations[i].activity[j]])
        //console.log("\tActivity1 ID: ", activity1Id.insertId)
        let insertActivity1ConnectAcitivity2 = db.query('INSERT INTO LocationConnectActivity(`entryId`, `a1`) VALUES(' + entryId.insertId + ',' + activity1Id.insertId + ')')


        if ('activity' in userArray[n]._data.locations[i].activity[j]) {
          for (k = 0; k < userArray[n]._data.locations[i].activity[j].activity.length; k++) {
            activity2Id = await bulkInsert(db, 'activity2', [userArray[n]._data.locations[i].activity[j].activity[k]])
            //console.log("\t\tActivity2 ID: ", activity2Id.insertId)
            let insertActivity1ConnectAcitivity2 = db.query('INSERT INTO Activity1ConnectActivity2(`a1`, `a2`) VALUES(' + activity1Id.insertId + ',' + activity2Id.insertId + ')')

          }
        }
      }
    }

  }
}
})

router.post('/test', async function (req, res) {



  // Sensitive Rectangular Array sent with the Ajax Post 
   var areas = JSON.parse(req.body.areas);
  
    console.log(areas)
  
  
    // var sensitiveRect = {
    //   _northEastLat: req.body._northEastLat,
    //   _northEastLng: req.body._northEastLng,
    //   _southWestLat: req.body._southWestLat,
    //   _southWestLng: req.body._southWestLng
    // }
  
    let jsonData = fs.readFileSync((path.resolve(__dirname, "../public/uploads/1.json")))
    jsonData = JSON.parse(jsonData);
  
    console.log(jsonData)
    
    //This is for Running the Code Async
    function makeDb() {
      var connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: '',
        database: 'ecoproject1',
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
  
    
    function bulkInsert(db, table, objectArray) {
      let keys = Object.keys(objectArray[0]);
      if (keys.includes("activity")) { // Checking if 
        keys.splice(keys.indexOf('activity'),1);
      }
      let values = objectArray.map(obj => keys.map(key => obj[key]));
      let sql = 'INSERT INTO ' + table + ' (' + keys.join(',') + ') VALUES ?';
      return db.query(sql, [values]);
    }
  
  
  
  
    let entryId;
    let activity1Id;
    let activity2Id;
  
    let i, j, k;
  
    let patrasCenter = new GeoPoint(38.230462, 21.753150);
    let pointToBeInserted;
  
    // Checking Sensitive Rectangular
    let upperleftBound;
    let lowerDownBound;
    let insertedPoint
  
  
    for (i = 0; i < jsonData.locations.length; i++) {
  
  
      pointToBeInserted = new GeoPoint(jsonData.locations[i].latitudeE7 * (Math.pow(10, -7)),
        jsonData.locations[i].longitudeE7 * (Math.pow(10, -7)));
  
      // If the point to be inserted out of 10Km Patras Cetner, Skip this Spot
      if (patrasCenter.distanceTo(pointToBeInserted, true) > 10) {
        //console.log("Out Of Patras")
        continue;
      }
  
      // If point is inside the sensitive Area, Skip This Point
      if (inRangeOfRect(areas, geopointToMyPoint(pointToBeInserted))) {
        //console.log("POINT IS INSIDE SENSITIVE AREA ")
        continue;
      }
  
      jsonData.locations[i].userId=userObject.userId;
      entryId = await bulkInsert(db, 'entry', [jsonData.locations[i]])
  
  
      //console.log("Entry ID: ", entryId.insertId);
  
  
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
    res.send("Upload Succefully");
    console.log("The End!");
  })
module.exports = router;
