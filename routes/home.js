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
const makeDb = require('../config/db.js')
const mysql = require('mysql');
const crypto = require('crypto');
const assert = require('assert');
const doAsync = require('doasync')
const fs = require('fs');
const ejs = require('ejs');
const util = require('util');

const upload = require('express-fileupload')

const { encrypt, decrypt } = require('../public/js/encryptDecrypt');
const { timeStamp } = require('console');
const { stringify } = require('querystring');
const { type } = require('jquery');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(express.json());
router.use(bodyParser());
router.use(upload())


router.use(session({ secret: 'ssshhhhh' }));
var sess;





router.get('/', function (req, res) {
  res.render('../views/index.ejs')
});


router.get('/upload', checkAuth, function (req, res) {
  res.render('../views/upload.ejs')
});


router.get('/admin', function (req, res) {
  res.render('../views/admin.ejs')
});



//accepts the username and the password from the user, with the POST method.
//encrypts the password, and sends it back to the user.
router.post('/signup', async function (req, res) {
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    var user = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username: req.body.firstname + ' ' + req.body.lastname,
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
var userObject = {
  username: '',
  email: '',
  userId: 0,
  ecoscore: 0
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

  sess = req.session;
  sess.userId = loginData.userId;



  connection.query("SELECT userId, username, admin FROM user WHERE userId= '" + loginData.userId + "'", function (err, result) {
    if (err) throw err;
    if (!result.length) {
      res.status(500).send("You can't Procced, no user Found");
      console.log(result);
    }
    else {
    

      console.log(result[0].username)
      userObject.username = result[0].username;
      var admin=result[0].admin;   
      userObject.userId = loginData.userId;
      userObject.email = loginData.email;
      console.log(userObject.userId);
      if(admin){
        res.redirect('/admin')
      }
      else{
      res.redirect('/mainpage');
    }}
  });



});

router.get('/admin', checkAuth, function (req, res) {
  res.render('../views/admin.ejs')
});

router.get('/mainPage', checkAuth, function (req, res) {
  res.render('../views/main_page.ejs', { x: userObject.username })
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
      else {
        res.send('File uploaded!');
      }
    })
  }

})

router.get('/leaderboard', function (req, res) {
  res.render('../views/leaderboard.ejs')
});

router.post('/leaderboard', async function (req, res) {
  const db = makeDb();
  var todayMonth = req.body.todayMonth;

  var eareseCurrentLeaderBoard = await db.query('truncate table userVehicleScore');
  eareseCurrentLeaderBoard = await db.query('truncate table userWalkingScore');
  eareseCurrentLeaderBoard = await db.query('truncate table userecoscore');

  var updateCurrentMonth = await db.query('UPDATE lastMonth set startingDate = ' + todayMonth);

  // GET GENERAL TOP 3 ECOSCORES
  var getEcoscores = await db.query('SELECT user.username, ecoscore FROM userEcoscore INNER JOIN user ON user.userId = userEcoscore.userId ORDER BY ecoscore DESC LIMIT 3')
  // GET CURRENT USER'S ECOSCORE
  var currentUserEcoscore = await db.query('SELECT user.username, ecoscore FROM userEcoscore INNER JOIN user ON user.userId = userEcoscore.userId WHERE user.userId = \'' + userObject.userId + '\'')


  const arrayColumn = (arr, n) => arr.map(x => x[n]); // Function to get Column N of 2D array.

  var outputData = getEcoscores.map(Object.values); // Converting Array of Objects into Array of Arrays

  var ecoscoreObject = {
    names: arrayColumn(outputData, 0), //Get the names 
    scores: arrayColumn(outputData, 1) //Get the Scores Coresponding
  }

  // CHECK IF ECOSCORE RESULT IS EMPTY
  if (!getEcoscores.length == 0) {
    // CHECK IF USER IS IN THE TOP 3, IF NOT ADD HIM AS THE EXTRA ELEMENT
    if (!ecoscoreObject['names'].includes(currentUserEcoscore[0].username)) {
      ecoscoreObject['names'].push(currentUserEcoscore[0].username);
      ecoscoreObject['scores'].push(currentUserEcoscore[0].ecoscore);
    }
  }
  console.log(ecoscoreObject)

  res.send(ecoscoreObject);



})

router.post('/ecocharts', /*checkAuth,*/async function (req, res) {
  var result;

  const db = makeDb();

  let hey1, hey2;
  var results;
  console.log("Hey I am in");
  var lastMonth = new Date();
  var m = lastMonth.getMonth();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  // If still in same month, set date to last day of 
  // previous month
  if (lastMonth.getMonth() == m) lastMonth.setDate(0);
  lastMonth.setHours(0, 0, 0);
  lastMonth.setMilliseconds(0);
  lastMonth = lastMonth;

  var lastYear = new Date();
  lastYear.setFullYear(lastYear.getFullYear() - 1);
  lastYear = lastYear;
  console.log(lastYear);
  results = await db.query("SELECT confidence, type, activity1.timestampMs  FROM entry INNER JOIN locationconnectactivity on entry.entryId=locationconnectactivity.entryId INNER JOIN activity1 on activity1.aa1=locationconnectactivity.a1 INNER JOIN activity1connectactivity2 on activity1.aa1=activity1connectactivity2.a1 INNER JOIN activity2 on activity2.aa2=activity1connectactivity2.a2  WHERE entry.userId='" + userObject.userId + "'");
  var firstDate = new Date;
  var lastDate = new Date(0);
  var walkingMonth = 0;
  var vehicleMonth = 1;
  var walkingYear = 0;
  var bicycleYear = 0;
  var vehicleYear = 0;
  var i;
  for (i = 0; i < results.length; i++) {
    var d = new Date(parseInt(results[i].timestampMs));
    if (d > lastDate) {
      lastDate = d;
    }
    if (d < firstDate) {
      firstDate = d;
    }
    if (d > lastYear) {
      if (results[i].type == 'ON_FOOT') {
        walkingYear = walkingYear + results[i].confidence;
      }
      else
        if (results[i].type == 'ON_BICYCLE') {
          bicycleYear = bicycleYear + results[i].confidence;
        }
        else
          if (results[i].type == 'IN_VEHICLE') {
            vehicleYear = vehicleYear + results[i].confidence;
          }
      if (d > lastMonth) {
        if (results[i].type == 'ON_FOOT' || results[i].type == 'ON_BICYCLE') {
          walkingMonth = walkingMonth + results[i].confidence;
        }
        else
          if (results[i].type == 'IN_VEHICLE') {
            vehicleMonth = vehicleMonth + results[i].confidence;

          }
      }

    }
  }
  // if (err) throw err;
  // if (!result.length) {
  //   res.status(500).send("You can't Proceed, no user Found");
  //   console.log(result);
  // }
  // else {
  //   hey1=result[0].walking;
  //   console.log(result);}

  //console.log(hey1[0].walking)


  // });
  // hey2 = await db.query("SELECT SUM(confidence) as vehicle FROM entry INNER JOIN locationconnectactivity on entry.entryId=locationconnectactivity.entryId INNER JOIN activity1 on activity1.aa1=locationconnectactivity.a1 INNER JOIN activity1connectactivity2 on activity1.aa1=activity1connectactivity2.a1 INNER JOIN activity2 on activity2.aa2=activity1connectactivity2.a2  WHERE type= 'IN_VEHICLE' AND entry.userId='" + userObject.userId + "'");
  // //   if (err) throw err;
  // //   if (!result.length) {
  // //     res.status(500).send("You can't Proceed, no user Found");
  // //     console.log(result);
  // //   }
  // //   else {
  // //     hey2 = result[0].vehicle;
  // //     console.log(result);
  // //   }
  // // });


  // console.log(hey2[0].vehicle)


  // var ecoscore = hey1[0].walking / (hey1[0].walking + hey2[0].vehicle) * 100;
  // ecoscore = JSON.stringify(ecoscore);
  let data = {
    firstdate: firstDate,
    lastdate: lastDate,
    ecoscore: (walkingMonth / (walkingMonth + vehicleMonth) / 100),
    walking: walkingYear / 100,
    bicycle: bicycleYear / 100,
    vehicle: vehicleYear / 100
  }
  res.send(data);




});


router.get('/charts', /*checkAuth,*/ function (req, res) {
  res.render('../views/ecocharts.ejs')
});

router.post('/upload', checkAuth, function (req, res) {
  console.log(req.files)
  res.send("DONE")

})




router.get('/troll', async function (req, res) {

  // Sensitive Rectangular sent with the Ajax Post 
  var sensitiveRect = {
    _northEastLat: req.body._northEastLat,
    _northEastLng: req.body._northEastLng,
    _southWestLat: req.body._southWestLat,
    _southWestLng: req.body._southWestLng
  }







  //This is for Running the Code Async
  const db = makeDb();


  function bulkInsert(db, table, objectArray) {
    let keys = Object.keys(objectArray[0]);
    if (keys.includes("activity")) { // Checking if 
      keys.splice(keys.indexOf('activity'), 1);
    }
    let values = objectArray.map(obj => keys.map(key => obj[key]));
    let sql = 'INSERT INTO ' + table + ' (' + keys.join(',') + ') VALUES ?';
    return db.query(sql, [values]);
  }

  var user = {
    _id: null,
    _data: null,
    createUser: function (id, data) {
      this._id = id;
      this._data = data;
    }

  }

  var userArray = [];
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


  for (n = 0; n < userArray.length; n++) {
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
      userArray[n]._data.locations[i].userId = userArray[n]._id;
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


router.post('/deleteData', async function(req, res){
  let db = makeDb();

  console.log("HERE!")
  var deleteData = db.query('CALL  deleteData()');

  res.send("Database data Deleted!");

})

router.post('/rangeDates', async function (req, res) {
  var dateForm = req.body

  //This is for Running the Code Async
  const db = makeDb();

  console.log(dateForm.until, "  ", dateForm.since, "--", userObject.userId)
  var rangedDates = await db.query('SELECT latitudeE7, longitudeE7, confidence ,type, activity1.timestampMs FROM entry INNER JOIN locationconnectactivity on entry.entryId=locationconnectactivity.entryId INNER JOIN activity1 on activity1.aa1=locationconnectactivity.a1 INNER JOIN activity1connectactivity2 on activity1.aa1=activity1connectactivity2.a1 INNER JOIN activity2 on activity2.aa2=activity1connectactivity2.a2 WHERE activity1.timestampMs > ' + dateForm.since + ' AND activity1.timestampMs < ' + dateForm.until + ' AND userId = \'' + userObject.userId + '\'')

  var i;
  var locationsObject;
  var statsObject;
  var statsObjectAr = [];
  var objectForHeatmap //This is a javascript object that HeatmapJs understands and translate it into colors
  var locationsObjectArr = [];
  var type = {
    vehicle: 0,
    running: 0,
    walking: 0,
    tilting: 0,
    still: 0,
    bicycle: 0,
    unknown: 0,
  }
  function calcDays(Object, type) {
    let days = [0, 0, 0, 0, 0, 0, 0];
    let hours = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    var i;
    for (i = 0; i < Object.length; i++) {
      if (Object[i].type == type) {
        var d = new Date(parseInt(Object[i].time));
        days[d.getDay()]++;
        hours[d.getHours()]++;
      }
    }
    var day = {
      Sunday: days[0],
      Monday: days[1],
      Tuesday: days[2],
      Wednesday: days[3],
      Thursday: days[4],
      Friday: days[5],
      Saturday: days[6]
    }
    var hour = {
      '00:00': hours[0],
      '01:00': hours[1],
      '02:00': hours[2],
      '03:00': hours[3],
      '04:00': hours[4],
      '05:00': hours[5],
      '06:00': hours[6],
      '07:00': hours[7],
      '08:00': hours[8],
      '09:00': hours[9],
      '10:00': hours[10],
      '11:00': hours[11],
      '12:00': hours[12],
      '13:00': hours[13],
      '14:00': hours[14],
      '15:00': hours[15],
      '16:00': hours[16],
      '17:00': hours[17],
      '18:00': hours[18],
      '19:00': hours[19],
      '20:00': hours[20],
      '21:00': hours[21],
      '22:00': hours[22],
      '23:00': hours[23]
    }
    var statData = {
     day: day,
     hour: hour
    }
    return statData;
  }
  for (i = 0; i < rangedDates.length; i++) {
    locationsObject = {
      lat: rangedDates[i].latitudeE7 * Math.pow(10, -7),
      lng: rangedDates[i].longitudeE7 * Math.pow(10, -7),
      count: 1
    }
    statsObject = {
      type: rangedDates[i].type,
      time: rangedDates[i].timestampMs,
      confidence: rangedDates[i].confidence
    }
    locationsObjectArr.push(locationsObject)
    statsObjectAr.push(statsObject)
    switch (statsObject.type) {
      case 'IN_VEHICLE':
        type.vehicle = type.vehicle + statsObject.confidence;
        break;
      case 'RUNNING':
        type.running = type.running + statsObject.confidence;
        break;
      case 'WALKING':
        type.walking = type.walking + statsObject.confidence;
        break;
      case 'TILTING':
        type.tilting = type.tilting + statsObject.confidence;
        break;
      case 'STILL':
        type.still = type.still + statsObject.confidence;
        break;
      case 'ON_BICYCLE':
        type.bicycle = type.bicycle + statsObject.confidence;
        break;
      case 'UNKNOWN':
        type.unknown = type.unknown + statsObject.confidence;
        break;
    }
  }
  let finalObjectArr = [
    {
      type: 'IN_VEHICLE',
      date: calcDays(statsObjectAr, 'IN_VEHICLE').day,
      hours: calcDays(statsObjectAr, 'IN_VEHICLE').hour
    },
    {
      type: 'RUNNING',
      date: calcDays(statsObjectAr, 'RUNNING').day,
      hours: calcDays(statsObjectAr, 'RUNNING').hour
    },
    {
      type: 'WALKING',
      date: calcDays(statsObjectAr, 'WALKING').day,
      hours: calcDays(statsObjectAr, 'WALKING').hour
    },
    {
      type: 'TILTING',
      date: calcDays(statsObjectAr, 'TILTING').day,
      hours: calcDays(statsObjectAr, 'TILTING').hour
    },
    {
      type: 'STILL',
      date: calcDays(statsObjectAr, 'STILL').day,
      hours: calcDays(statsObjectAr, 'STILL').hour
    },
    {
      type: 'ON_BICYCLE',
      date: calcDays(statsObjectAr, 'ON_BICYCLE').day,
      hours: calcDays(statsObjectAr, 'ON_BICYCLE').hour
    },
    {
      type: 'UNKNOWN',
      date: calcDays(statsObjectAr, 'UNKNOWN').day,
      hours: calcDays(statsObjectAr, 'UNKNOWN').hour
    }
  ]
  console.log(locationsObjectArr)
  console.log(finalObjectArr.type);




  console.log(type);
  
  objectForHeatmap = {
    data: locationsObjectArr,
    max: locationsObjectArr.length
  }
  res.send({objectForHeatmap,finalObjectArr});
})

router.post('/getHeatmap', async function (req, res) {

  const db = makeDb();

  var rangedDates = await db.query('SELECT latitudeE7, longitudeE7 FROM `entry` WHERE userId = \'' + userObject.userId + '\'')

  var i;
  var locationsObject;
  var objectForHeatmap //This is a javascript object that HeatmapJs understands and translate it into colors
  var locationsObjectArr = [];

  for (i = 0; i < rangedDates.length; i++) {
    locationsObject = {
      lat: rangedDates[i].latitudeE7 * Math.pow(10, -7),
      lng: rangedDates[i].longitudeE7 * Math.pow(10, -7),
      count: 1
    }
    locationsObjectArr.push(locationsObject)
  }

  objectForHeatmap = {
    data: locationsObjectArr,
    max: locationsObjectArr.length
  }
  res.send(objectForHeatmap);

})

router.post('/test', async function (req, res) {

  var date = new Date();
  var timestamp = date.getTime();
  // Sensitive Rectangular Array sent with the Ajax Post 
  var areas = JSON.parse(req.body.areas);

  //console.log(areas)



  let jsonData = fs.readFileSync((path.resolve(__dirname, "../public/uploads/1.json")))
  jsonData = JSON.parse(jsonData);

  console.log(jsonData)

  const db = makeDb();


  function bulkInsert(db, table, objectArray) {
    let keys = Object.keys(objectArray[0]);
    if (keys.includes("activity")) { // Checking if 
      keys.splice(keys.indexOf('activity'), 1);
    }
    let values = objectArray.map(obj => keys.map(key => obj[key]));
    let sql = 'INSERT INTO ' + table + ' (' + keys.join(',') + ') VALUES ?';
    return db.query(sql, [values]);
  }


  // let speedupInsert = await db.query("SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\"") 
  // speedupInsert = await db.query("SET AUTOCOMMIT = 0")
  // speedupInsert = await db.query("SET unique_checks = 0;")
  // speedupInsert = await db.query("SET foreign_key_checks=0;")
  // speedupInsert = await db.query("START TRANSACTION;")
  // console.log(speedupInsert)

  let entryId;
  let activity1Id;
  let activity2Id;

  let i, j, k;

  let patrasCenter = new GeoPoint(38.230462, 21.753150);
  let pointToBeInserted;


  for (i = 0; i < jsonData.locations.length; i++) {


    pointToBeInserted = new GeoPoint(jsonData.locations[i].latitudeE7 * (Math.pow(10, -7)),
      jsonData.locations[i].longitudeE7 * (Math.pow(10, -7)));

    // If the point to be inserted out of 10Km Patras Cetner, Skip this Spot
    if (patrasCenter.distanceTo(pointToBeInserted, true) > 10) {
      console.log("Out Of Patras")
      continue;
    }

    // If point is inside the sensitive Area, Skip This Point
    if (inRangeOfRect(areas, geopointToMyPoint(pointToBeInserted))) {
      console.log("POINT IS INSIDE SENSITIVE AREA ")
      continue;
    }

    jsonData.locations[i].userId = userObject.userId;
    entryId = await bulkInsert(db, 'entry', [jsonData.locations[i]])



    console.log("Entry ID: ", entryId.insertId);


    if ('activity' in jsonData.locations[i]) {
      for (j = 0; j < jsonData.locations[i].activity.length; j++) {
        activity1Id = await bulkInsert(db, 'activity1', [jsonData.locations[i].activity[j]])
        //console.log("\tActivity1 ID: ", activity1Id.insertId)
        let insertActivity1ConnectAcitivity2 = await db.query('INSERT INTO LocationConnectActivity(`entryId`, `a1`) VALUES(' + entryId.insertId + ',' + activity1Id.insertId + ')')


        if ('activity' in jsonData.locations[i].activity[j]) {
          for (k = 0; k < jsonData.locations[i].activity[j].activity.length; k++) {
            activity2Id = await bulkInsert(db, 'activity2', [jsonData.locations[i].activity[j].activity[k]])
            //console.log("\t\tActivity2 ID: ", activity2Id.insertId)
            let insertActivity1ConnectAcitivity2 = await db.query('INSERT INTO Activity1ConnectActivity2(`a1`, `a2`) VALUES(' + activity1Id.insertId + ',' + activity2Id.insertId + ')')

          }
        }
      }
    }
  }

  let lastFileUpload = await db.query("INSERT INTO `userLastUpload`(`date`,`userId`) VALUES('" + timestamp + "', '" + userObject.userId + "')")
  res.send("Upload Succefully");
  console.log("The End!");
})


module.exports = router;







