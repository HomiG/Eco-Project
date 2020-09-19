
const GeoPoint = require('geopoint')
const { inRangeOfRect, geopointToMyPoint } = require('../public/js/myGeographicalModules')
const convertQuerryToHeatmapObject = require('../public/js/convertQuerryToHeatmapObject')


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
var objToXml = require('obj-to-xml');

const upload = require('express-fileupload')

const { encrypt, decrypt } = require('../public/js/encryptDecrypt');
const { timeStamp } = require('console');
const { stringify } = require('querystring');
const { type, data } = require('jquery');
const { parse } = require('path');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');

var rimraf = require("rimraf");

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

router.post('/logout', checkAuth, function (req, res) {
  req.session.destroy();
  try {
    patha = (__dirname + "/../public/downloads")
    rimraf.sync(patha)
    fs.mkdir(patha, function (err) {
      if (err) {
        console.log(err)
      } else {
        console.log("New directory successfully created.")
      }
    })
    // fs.unlinkSync(path.resolve(__dirname, "../public/downloads"))
    console.log('removed!!')
    //file removed
  } catch (err) {
    console.error(err)
  }
  res.redirect('/');
})


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

  catch {
    res.status(500)
  }
});
var userObject = {
  username: '',
  email: '',
  userId: 0,
  ecoscore: 0,
  admin: 0
}


async function checkAuth(req, res, next) {
  if (!req.session.userId) {
    res.send('You are not logged in, please login first in order to view this page');

  } else {
    next();
  }
}

function checkAdmin(req, res, next) {

  if (!userObject.admin) {

    res.send('You are not authorised to view this page');

  } else {
    next();
  }
}
router.get('/download/:type', function (req, res) {

  var typeParam = req.params.type.toLowerCase();;

  res.download(__dirname + "/../public/downloads/EcoData." + typeParam, "EcoData." + typeParam)
})

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
      var admin = result[0].admin;
      userObject.userId = loginData.userId;
      userObject.email = loginData.email;
      userObject.admin = result[0].admin;
      console.log(userObject.userId);
      if (admin) {
        res.redirect('/admin')
      }
      else {
        res.redirect('/mainpage');
      }
    }
  });



});

router.get('/admin', checkAuth, checkAdmin, function (req, res) {
  res.render('../views/admin.ejs')
});

router.get('/mainPage', checkAuth, function (req, res) {
  res.render('../views/main_page.ejs', { x: userObject.username })
});

router.get('/statistics', function (req, res) {
  res.render('../views/statistics.ejs')
});

router.post('/uploadJson', function (req, res) {


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

  var j=0;

  for (j=0; j < getEcoscores.length; j++) {
    getEcoscores[j]['username'] = getEcoscores[j]['username'].substring(0, getEcoscores[j]['username'].indexOf(' ') + 2) + '.';
    console.log('INSIDE FOR', getEcoscores[j]['username'])
  }

  console.log(getEcoscores)
  console.log(currentUserEcoscore)

  const arrayColumn = (arr, n) => arr.map(x => x[n]); // Function to get Column N of 2D array.

  var outputData = getEcoscores.map(Object.values); // Converting Array of Objects into Array of Arrays

  var ecoscoreObject = {
    names: arrayColumn(outputData, 0), //Get the names 
    scores: arrayColumn(outputData, 1) //Get the Scores Coresponding
  }
  console.log(ecoscoreObject)


  // CHECK IF ECOSCORE RESULT IS EMPTY
  if (!getEcoscores.length == 0) {
    if (!currentUserEcoscore[0]) {
      var currentUserEcoscore = [];
      currentUserEcoscore.push({ username: userObject.username.substring(0, userObject.username.indexOf(' ') + 2) + '.', ecoscore: 0 })
      // currentUserEcoscore[0].ecoscore=0;
      // currentUserEcoscore[0].username = userObject.username;
    }

    // CHECK IF USER IS IN THE TOP 3, IF NOT ADD HIM AS THE EXTRA ELEMENT
    if (!ecoscoreObject['names'].includes(currentUserEcoscore[0].username.substring(0, currentUserEcoscore[0].username.indexOf(' ') + 2) + '.')) {
      ecoscoreObject['names'].push(currentUserEcoscore[0].username);
      ecoscoreObject['scores'].push(currentUserEcoscore[0].ecoscore);
    }

  }
  console.log(ecoscoreObject)

  res.send(ecoscoreObject);



})

router.post('/ecocharts', checkAuth, async function (req, res) {
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

  results = await db.query("SELECT type, activity1.timestampMs  FROM entry " +
    "INNER JOIN locationconnectactivity on entry.entryId=locationconnectactivity.entryId " +
    "INNER JOIN activity1 on activity1.aa1=locationconnectactivity.a1 " +
    "WHERE entry.userId='" + userObject.userId + "'");

  var lastFileUpload = await db.query('SELECT date FROM userLastUpload WHERE userId = \'' + userObject.userId + '\' ORDER BY date ASC LIMIT 1')
  console.log(lastFileUpload[0].date)

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
        walkingYear++;
      }
      else
        if (results[i].type == 'ON_BICYCLE') {
          bicycleYear++;
        }
        else
          if (results[i].type == 'IN_VEHICLE') {
            vehicleYear++;
          }
      if (d > lastMonth) {
        if (results[i].type == 'ON_FOOT' || results[i].type == 'ON_BICYCLE') {
          walkingMonth++;
        }
        else
          if (results[i].type == 'IN_VEHICLE') {
            vehicleMonth++;

          }
      }

    }
  }


  let data = {
    firstdate: firstDate,
    lastdate: lastDate,
    ecoscore: (walkingMonth / (walkingMonth + vehicleMonth)),
    walking: walkingYear,
    bicycle: bicycleYear,
    vehicle: vehicleYear,
    lastFileUpload: lastFileUpload[0].date
  }
  res.send(data);




});

router.get('/radar', checkAuth, function (req, res) {
  res.render('../views/radar.ejs')
});

router.get('/charts', checkAuth, function (req, res) {
  res.render('../views/ecocharts.ejs')
});

router.post('/upload', checkAuth, function (req, res) {
  console.log(req.files)
  res.send("DONE")

})

router.post('/export', async function (req, res) {
  // const db = makeDb();
  // var dateForm = req.body;
  // // console.log(dateForm.until, "  ", dateForm.since, "--", userObject.userId)
  // var data2export = await db.query('SELECT heading, activity1.type, activity1.timestampMs, verticalAccuracy, velocity, accuracy, longitudeE7, latitudeE7, altitude, entry.timestampMs, entry.userId as id  FROM entry INNER JOIN locationconnectactivity ON entry.entryId=locationconnectactivity.entryId INNER JOIN activity1 ON activity1.aa1=locationconnectactivity.a1 WHERE activity1.timestampMs > ' + dateForm.since + ' AND activity1.timestampMs < ' + dateForm.until)
  //  console.log(dateForm);
  // res.send(data2export)
  function getKeyByValue(object, value) {
    return Object.keys(object).filter(key => object[key] === value);
  }

  function dayStringToNumber(dayString) {
    let weekday = ['Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday']

    return (weekday.indexOf(dayString));
  }


  var mode = req.body.mode;

  var dates = JSON.parse(req.body.dates)

  var checkboxes = JSON.parse(req.body.checkboxes)

  var tickedCheckboxes = getKeyByValue(checkboxes, true)
  var choices = req.body.choices;
  console.log('chose:', choices)
  // console.log(mode);
  console.log(dates);




  // Get the fields from the Date object, that have to value
  var emptyFields = getKeyByValue(dates, '');



  // Checks if what has came into the database is empty and if so
  // Substracts 1 on MONTHS AND DAYS(Monday, Tuesday...)
  // Parse Strings into integes for later comparison
  //
  function calibrateDatesForDatabaseFiltering(dates, emptyFields) {

    for (var i = 0; i < emptyFields.length; i++) {
      if (emptyFields[i] == 'fromDate') { // check if from is empty
        dates[emptyFields[i]] = 1900
      }
      else if (emptyFields[i] == 'untilDate') { // check if until date is empty 
        dates[emptyFields[i]] = 2200;
      }
      else if (emptyFields[i] == 'fromMonth') { // check if from month is empty 
        dates[emptyFields[i]] = 0;
      }
      else if (emptyFields[i] == 'untilMonth') { // check if until Month is empty 
        dates[emptyFields[i]] = 11;
      }
      else if (emptyFields[i] == 'fromDay') { // check if from day is empty 
        dates[emptyFields[i]] = 0;
      }
      else if (emptyFields[i] == 'untilDay') { // check if until day is empty 
        dates[emptyFields[i]] = 6;
      }
      else if (emptyFields[i] == 'fromTime') { // check if from time is empty 
        dates[emptyFields[i]] = 0;
      }
      else if (emptyFields[i] == 'untilTime') { // check if until time is empty 
        dates[emptyFields[i]] = 23;
      }
    }


    if (!emptyFields.includes('fromDate')) {
      dates['fromDate'] = parseInt(dates['fromDate'])
    }
    if (!emptyFields.includes('untilDate')) {
      dates['untilDate'] = parseInt(dates['untilDate'])
    }
    if (!emptyFields.includes('fromMonth')) {
      dates['fromMonth'] = dates['fromMonth'] - 1;
    }
    if (!emptyFields.includes('untilMonth')) {
      dates['untilMonth'] = dates['untilMonth'] - 1;
    }
    if (!emptyFields.includes('fromDay')) {
      dates['fromDay'] = dayStringToNumber(dates['fromDay'])
    }
    if (!emptyFields.includes('untilDay')) {
      dates['untilDay'] = dayStringToNumber(dates['untilDay'])
    }
    if (!emptyFields.includes('fromTime')) {
      dates['fromTime'] = parseInt(dates['fromTime'])
    }
    if (!emptyFields.includes('untilTime')) {
      dates['untilTime'] = parseInt(dates['untilTime'])
    }


  }

  calibrateDatesForDatabaseFiltering(dates, emptyFields);
  console.log(dates)

  function JsonToCsv(jsonData) {
    var items = jsonData;
    var replacer = (key, value) => value === null ? ' ' : value; // specify how you want to handle null values here
    var header = Object.keys(items[0]);
    var csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    csv.unshift(header.join(','));
    csv = csv.join('\r\n');

    return csv;
  }

  function OBJtoXML(obj) {
    var xml = '';
    for (var prop in obj) {
      xml += "<" + prop + ">";
      if (Array.isArray(obj[prop])) {
        for (var array of obj[prop]) {

          // A real botch fix here
          xml += "</" + prop + ">";
          xml += "<" + prop + ">";

          xml += OBJtoXML(new Object(array));
        }
      } else if (typeof obj[prop] == "object") {
        xml += OBJtoXML(new Object(obj[prop]));
      } else {
        xml += obj[prop];
      }
      xml += "</" + prop + ">";
    }
    var xml = xml.replace(/<\/?[0-9]{1,}>/g, '');
    return xml
  }






  // ----- CONVERTING THE ARRAY OF CHECKBOXES INTO WHAT TYPES TO CALL FROM THE DATABASE! ----- //
  var encloseWithinQuotes = "'" + tickedCheckboxes.join("','") + "'";
  var stringForSQLQuery = encloseWithinQuotes.replace(/,/g, ' OR TYPE = ');
  // ----- CONVERTING THE ARRAY OF CHECKBOXES INTO WHAT TYPES TO CALL FROM THE DATABASE! ----- //



  var db = makeDb();


  var query;


  switch (parseInt(mode)) {
    case 2: // YES Date , NO Checkbox
      query = await db.query(' SELECT heading, activity1.type, entry.timestampMs, verticalAccuracy, velocity, accuracy, longitudeE7, latitudeE7, altitude, entry.timestampMs, entry.userId as id FROM entry ' +
        'INNER JOIN locationconnectactivity on entry.entryId=locationconnectactivity.entryId ' +
        'INNER JOIN activity1 on activity1.aa1=locationconnectactivity.a1');
      break;
    case 3: // NO Date, YES Checkbox
      query = await db.query('SELECT heading, activity1.type, entry.timestampMs, verticalAccuracy, velocity, accuracy, longitudeE7, latitudeE7, altitude, entry.timestampMs, entry.userId as id   FROM `entry` ' +
        'INNER JOIN locationconnectactivity on locationconnectactivity.entryId =entry.entryId ' +
        'INNER JOIN activity1 on activity1.aa1=a1 ' +
        'WHERE type = ' + stringForSQLQuery); // Includes only the places the person have been on a spefic catagory of movement
      break;
    case 4: // YES Date, YES Checbox
      query = await db.query('SELECT heading, activity1.type, entry.timestampMs, verticalAccuracy, velocity, accuracy, longitudeE7, latitudeE7, altitude, entry.timestampMs, entry.userId as id  FROM `entry` ' +
        'INNER JOIN locationconnectactivity on locationconnectactivity.entryId =entry.entryId ' +
        'INNER JOIN activity1 on activity1.aa1=a1 ' +
        'WHERE type = ' + stringForSQLQuery);
      break;
    default:
    // code block
  }
  var i;
  var dataset = [];
  for (i = 0; i < query.length; i++) {
    var currentTimestamp = new Date(parseInt(query[i].timestampMs));
    //console.log(currentTimestamp.getYear() + 1900 + ' >= ' + dates.dateForm + "   " + (currentTimestamp.getYear() + 1900) + '  <=  ' + dates.untilDate);

    if ((currentTimestamp.getYear() + 1900 >= dates.fromDate) && (currentTimestamp.getYear() + 1900) <= dates.untilDate) { // Check Year
      // console.log("Pass 1");
      // console.log((currentTimestamp.getMonth()) +'  >=  '+ dates.fromMonth  + "  ++  " + (currentTimestamp.getMonth()) + '  <=  ' + dates.untilMonth);
      if ((currentTimestamp.getMonth() >= dates.fromMonth) && (currentTimestamp.getMonth() <= dates.untilMonth)) { // Check Month
        // console.log("Pass 2");
        if ((currentTimestamp.getDay() >= dates.fromDay) && (currentTimestamp.getDay() <= dates.untilDay)) { // Check Day
          // console.log("Pass 3");
          if ((currentTimestamp.getHours() >= dates.fromTime) && (currentTimestamp.getHours() <= dates.untilTime)) { // Check Check Time
            // console.log("Pass 4");
            dataset.push(query[i]);
          }
        }
      }
    }
  }
  var obje = { data: dataset }
  //console.log(JSON.parse(JSON.stringify(obje)))
  switch (choices) {
    case 'JSON':
      console.log("JSON")
      //fs.writeFileSync(__dirname + "/../public/downloads/EcoData.json", JSON.stringify({ A: 1, b: 2 }))
      fs.writeFileSync(__dirname + "/../public/downloads/EcoData.json", JSON.stringify(obje))
      break;
    case "CSV":
      var csv = JsonToCsv(dataset);
      fs.writeFileSync(__dirname + "/../public/downloads/EcoData.csv", csv)
      break;
    case "XML":
      var xml = OBJtoXML(dataset);
      fs.writeFileSync(__dirname + "/../public/downloads/EcoData.xml", xml)
  }
  res.send('Done');
})





router.get('/drawfullheatmap', async function (req, res) {
  var db = makeDb();

  var allHeatmapData = await db.query('SELECT latitudeE7, longitudeE7 FROM `entry` ');


  var objectForHeatmap = convertQuerryToHeatmapObject(allHeatmapData);

  res.send(objectForHeatmap);

})


router.post('/drawSpecifiedHeatmap', async function (req, res) {
  console.log(req.body);


  // Get ARRAY of key given value If Multiple keys have Same value 
  function getKeyByValue(object, value) {
    return Object.keys(object).filter(key => object[key] === value);
  }


  function dayStringToNumber(dayString) {
    let weekday = ['Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday']

    return (weekday.indexOf(dayString));
  }


  var mode = req.body.mode;

  var dates = JSON.parse(req.body.dates)

  var checkboxes = JSON.parse(req.body.checkboxes)

  var tickedCheckboxes = getKeyByValue(checkboxes, true)
  var choices = req.body.choices;

  // console.log(mode);
  console.log(dates);
  //console.log(checkboxes);

  // fromDate: '2015',
  //   untilDate: '2025',
  //     fromMonth: '01',
  //       untilMonth: '12',
  //         fromDay: 'Monday',
  //           untilDay: 'Sunday',
  //             fromTime: '',
  //               untilTime: ''




  // Get the fields from the Date object, that have to value
  var emptyFields = getKeyByValue(dates, '');





  // Checks if what has came into the database is empty and if so
  // Substracts 1 on MONTHS AND DAYS(Monday, Tuesday...)
  // Parse Strings into integes for later comparison
  //
  function calibrateDatesForDatabaseFiltering(dates, emptyFields) {

    for (var i = 0; i < emptyFields.length; i++) {
      if (emptyFields[i] == 'fromDate') { // check if from is empty
        dates[emptyFields[i]] = 1900
      }
      else if (emptyFields[i] == 'untilDate') { // check if until date is empty 
        dates[emptyFields[i]] = 2200;
      }
      else if (emptyFields[i] == 'fromMonth') { // check if from month is empty 
        dates[emptyFields[i]] = 0;
      }
      else if (emptyFields[i] == 'untilMonth') { // check if until Month is empty 
        dates[emptyFields[i]] = 11;
      }
      else if (emptyFields[i] == 'fromDay') { // check if from day is empty 
        dates[emptyFields[i]] = 0;
      }
      else if (emptyFields[i] == 'untilDay') { // check if until day is empty 
        dates[emptyFields[i]] = 6;
      }
      else if (emptyFields[i] == 'fromTime') { // check if from time is empty 
        dates[emptyFields[i]] = 0;
      }
      else if (emptyFields[i] == 'untilTime') { // check if until time is empty 
        dates[emptyFields[i]] = 23;
      }
    }


    if (!emptyFields.includes('fromDate')) {
      dates['fromDate'] = parseInt(dates['fromDate'])
    }
    if (!emptyFields.includes('untilDate')) {
      dates['untilDate'] = parseInt(dates['untilDate'])
    }
    if (!emptyFields.includes('fromMonth')) {
      dates['fromMonth'] = dates['fromMonth'] - 1;
    }
    if (!emptyFields.includes('untilMonth')) {
      dates['untilMonth'] = dates['untilMonth'] - 1;
    }
    if (!emptyFields.includes('fromDay')) {
      dates['fromDay'] = dayStringToNumber(dates['fromDay'])
    }
    if (!emptyFields.includes('untilDay')) {
      dates['untilDay'] = dayStringToNumber(dates['untilDay'])
    }
    if (!emptyFields.includes('fromTime')) {
      dates['fromTime'] = parseInt(dates['fromTime'])
    }
    if (!emptyFields.includes('untilTime')) {
      dates['untilTime'] = parseInt(dates['untilTime'])
    }


  }

  calibrateDatesForDatabaseFiltering(dates, emptyFields);
  console.log(dates)









  // ----- CONVERTING THE ARRAY OF CHECKBOXES INTO WHAT TYPES TO CALL FROM THE DATABASE! ----- //
  var encloseWithinQuotes = "'" + tickedCheckboxes.join("','") + "'";
  var stringForSQLQuery = encloseWithinQuotes.replace(/,/g, ' OR TYPE = ');
  // ----- CONVERTING THE ARRAY OF CHECKBOXES INTO WHAT TYPES TO CALL FROM THE DATABASE! ----- //



  var db = makeDb();


  var query;


  switch (parseInt(mode)) {
    case 2: // YES Date , NO Checkbox
      query = await db.query(' SELECT latitudeE7, longitudeE7, entry.timestampMs FROM entry ' +
        'INNER JOIN locationconnectactivity on entry.entryId=locationconnectactivity.entryId ' +
        'INNER JOIN activity1 on activity1.aa1=locationconnectactivity.a1');
      break;
    case 3: // NO Date, YES Checkbox
      query = await db.query('SELECT entry.latitudeE7, entry.longitudeE7 FROM `entry` ' +
        'INNER JOIN locationconnectactivity on locationconnectactivity.entryId =entry.entryId ' +
        'INNER JOIN activity1 on activity1.aa1=a1 ' +
        'WHERE type = ' + stringForSQLQuery); // Includes only the places the person have been on a spefic catagory of movement
      break;
    case 4: // YES Date, YES Checbox

      query = await db.query('SELECT entry.latitudeE7, entry.longitudeE7, entry.timestampMs FROM `entry` ' +
        'INNER JOIN locationconnectactivity on locationconnectactivity.entryId =entry.entryId ' +
        'INNER JOIN activity1 on activity1.aa1=a1 ' +
        'WHERE type = ' + stringForSQLQuery);
      break;
    default:
    // code block
  }

  // ENDING HERE I HAVE GOT FROM THE DATABASE THE LOCATION having SPECIFIC ACTIVITIES (if asked)
  // NOW TIME (if asked) has to be DETERMINED!

  console.log("Query Result ", query, '\n END')

  var i;
  var rangedLocations = [];
  for (i = 0; i < query.length; i++) {
    var currentTimestamp = new Date(parseInt(query[i].timestampMs));
    //console.log(currentTimestamp.getYear() + 1900 + ' >= ' + dates.dateForm + "   " + (currentTimestamp.getYear() + 1900) + '  <=  ' + dates.untilDate);

    if ((currentTimestamp.getYear() + 1900 >= dates.fromDate) && (currentTimestamp.getYear() + 1900) <= dates.untilDate) { // Check Year
      // console.log("Pass 1");
      // console.log((currentTimestamp.getMonth()) +'  >=  '+ dates.fromMonth  + "  ++  " + (currentTimestamp.getMonth()) + '  <=  ' + dates.untilMonth);
      if ((currentTimestamp.getMonth() >= dates.fromMonth) && (currentTimestamp.getMonth() <= dates.untilMonth)) { // Check Month
        // console.log("Pass 2");
        if ((currentTimestamp.getDay() >= dates.fromDay) && (currentTimestamp.getDay() <= dates.untilDay)) { // Check Day
          // console.log("Pass 3");
          if ((currentTimestamp.getHours() >= dates.fromTime) && (currentTimestamp.getHours() <= dates.untilTime)) { // Check Check Time
            // console.log("Pass 4");
            rangedLocations.push(query[i]);
          }
        }
      }
    }
  }

  var objectTobeSendToFrontEnd = convertQuerryToHeatmapObject(rangedLocations);

  res.send(objectTobeSendToFrontEnd);


})




router.post('/deleteData', async function (req, res) {
  let db = makeDb();

  console.log("HERE!")
  var deleteData = await db.query('CALL deleteData()');
  console.log(deleteData)

  res.send("Database data Deleted!");

})
router.post('/radarRangeDates', async function (req, res) {

  var dateForm = req.body

  //This is for Running the Code Async
  const db = makeDb();

  console.log(dateForm.until, "  ", dateForm.since, "--", userObject.userId)
  var radarDates = await db.query('SELECT type, activity1.timestampMs FROM entry INNER JOIN locationconnectactivity on entry.entryId=locationconnectactivity.entryId INNER JOIN activity1 on activity1.aa1=locationconnectactivity.a1 WHERE activity1.timestampMs > ' + dateForm.since + ' AND activity1.timestampMs < ' + dateForm.until + ' AND userId = \'' + userObject.userId + '\'')

  var i;

  var statsObject;
  var statsObjectAr = [];


  var tipos = {
    vehicle: 0,
    foot: 0,
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
  for (i = 0; i < radarDates.length; i++) {

    statsObject = {
      type: radarDates[i].type,
      time: radarDates[i].timestampMs
    }

    statsObjectAr.push(statsObject)
    switch (statsObject.type) {
      case 'IN_VEHICLE':
        tipos.vehicle++;
        break;
      case 'ON_FOOT':
        tipos.foot++;
        break;
      case 'TILTING':
        tipos.tilting++;
        break;
      case 'STILL':
        tipos.still++;
        break;
      case 'ON_BICYCLE':
        tipos.bicycle++;
        break;
      case 'UNKNOWN':
        tipos.unknown++;
        break;
    }
  }
  let finalObject = {
    vehicle: {
      type: tipos.vehicle,
      date: calcDays(statsObjectAr, 'IN_VEHICLE').day,
      hours: calcDays(statsObjectAr, 'IN_VEHICLE').hour
    },
    foot: {
      type: tipos.foot,
      date: calcDays(statsObjectAr, 'ON_FOOT').day,
      hours: calcDays(statsObjectAr, 'ON_FOOT').hour
    },
    tilting: {
      type: tipos.tilting,
      date: calcDays(statsObjectAr, 'TILTING').day,
      hours: calcDays(statsObjectAr, 'TILTING').hour
    },
    still: {
      type: tipos.still,
      date: calcDays(statsObjectAr, 'STILL').day,
      hours: calcDays(statsObjectAr, 'STILL').hour
    },
    bicycle: {
      type: tipos.bicycle,
      date: calcDays(statsObjectAr, 'ON_BICYCLE').day,
      hours: calcDays(statsObjectAr, 'ON_BICYCLE').hour
    },
    unknown: {
      type: tipos.unknown,
      date: calcDays(statsObjectAr, 'UNKNOWN').day,
      hours: calcDays(statsObjectAr, 'UNKNOWN').hour
    }

  }
  //console.log(locationsObjectArr)
  // console.log(finalObject['bicycle']['hours']);


  var objectForHeatmap = convertQuerryToHeatmapObject(radarDates);


  //console.log(type);


  res.send(finalObject);
})

router.post('/rangeDates', async function (req, res) {
  var dateForm = req.body

  //This is for Running the Code Async
  const db = makeDb();

  console.log(dateForm.until, "  ", dateForm.since, "--", userObject.userId)
  console.log(dateForm)
  var rangedDates = await db.query('SELECT latitudeE7, longitudeE7 FROM entry  WHERE entry.timestampMs > ' + dateForm.since + ' AND entry.timestampMs < ' + dateForm.until + ' AND userId = \'' + userObject.userId + '\'')

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

  // //console.log(locationsObjectArr)
  // console.log(finalObject['bicycle']['hours']);




  //console.log(type);

  objectForHeatmap = {
    data: locationsObjectArr,
    max: locationsObjectArr.length
  }
  res.send(objectForHeatmap);
})
router.post('/statistics', async function (req, res) {

  //var dateForm = req.body

  //This is for Running the Code Async
  const db = makeDb();
  var users = await db.query('SELECT userId, username from user where admin=0')
  // console.log(dateForm.until, "  ", dateForm.since, "--", userObject.userId)
  var allthedata = await db.query('SELECT type , entry.userId as id , activity1.timestampMs as time FROM user INNER JOIN entry ON user.userId=entry.userId INNER JOIN locationconnectactivity on entry.entryId=locationconnectactivity.entryId INNER JOIN activity1 on activity1.aa1=locationconnectactivity.a1 ')
  // console.log(data);
  var i, j, k;


  var tipos = {
    vehicle: 0,
    feet: 0,
    tilting: 0,
    still: 0,
    bicycle: 0,
    unknown: 0,
  }

  var counts = {}
  var usercounts = {}
  for (j = 0; j < users.length; j++) {
    usercounts[JSON.stringify(users[j].userId)] = {
      username: users[j].username,
      count: 0
    }
  }
  // console.log(usercounts);
  // console.log(allthedata)

  for (i = 0; i < allthedata.length; i++) {
    usercounts[JSON.stringify(allthedata[i].id)].count++;
    let date = allthedata[i].time;
    var year = new Date(parseInt(date)).getFullYear();
    counts[year] = 0;
  }



  function calcDays(Object) {
    let days = [0, 0, 0, 0, 0, 0, 0];
    let hours = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let months = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    var i;
    for (i = 0; i < Object.length; i++) {

      var d = new Date(parseInt(Object[i].time));
      days[d.getDay()]++;
      hours[d.getHours()]++;
      months[d.getMonth()]++;
      counts[d.getFullYear()]++;

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
    var month = {
      January: months[0],
      February: months[1],
      March: months[2],
      April: months[3],
      May: months[4],
      June: months[5],
      July: months[6],
      August: months[7],
      September: months[8],
      October: months[9],
      November: months[10],
      December: months[11]
    }
    var statData = {
      day: day,
      hour: hour,
      month: month
    }
    return statData;
  }
  for (i = 0; i < allthedata.length; i++) {
    userObject = {
      name: allthedata[i].username,
      id: allthedata[i].userId
    }

    switch (allthedata[i].type) {
      case 'IN_VEHICLE':
        tipos.vehicle++;
        break;
      case 'ON_FOOT':
        tipos.feet++;
        break;
      case 'TILTING':
        tipos.tilting++;
        break;
      case 'STILL':
        tipos.still++;
        break;
      case 'ON_BICYCLE':
        tipos.bicycle++;
        break;
      case 'UNKNOWN':
        tipos.unknown++;
        break;
    }
  }
  var statData = calcDays(allthedata);
  let finalObject = {
    type: tipos,
    days: statData.day,
    hours: statData.hour,
    months: statData.month,
    years: counts,
    users: usercounts
  }
  //console.log(locationsObjectArr)
  // console.log(finalObject);
  res.send(finalObject);
});

router.post('/getHeatmap', async function (req, res) {

  const db = makeDb();

  var rangedDates = await db.query('SELECT latitudeE7, longitudeE7 FROM `entry` WHERE userId = \'' + userObject.userId + '\'')

  var objectForHeatmap = convertQuerryToHeatmapObject(rangedDates)


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

  //console.log(jsonData)

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
  let activityType;

  let i, j, k;

  let patrasCenter = new GeoPoint(38.230462, 21.753150);
  let pointToBeInserted;


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
      console.log("POINT IS INSIDE SENSITIVE AREA ")
      continue;
    }

    jsonData.locations[i].userId = userObject.userId;
    entryId = await bulkInsert(db, 'entry', [jsonData.locations[i]])



    //console.log("Entry ID: ", entryId.insertId);


    if ('activity' in jsonData.locations[i]) {
      for (j = 0; j < jsonData.locations[i].activity.length; j++) {
        //        console.log(jsonData.locations[i].activity[j])
        activityType = Object.values(jsonData.locations[i].activity[j]['activity'][0])[0] // Get The Activity Type with the Highest Confidence, aka the first one
        jsonData.locations[i].activity[j].type = activityType;
        activity1Id = await bulkInsert(db, 'activity1', [jsonData.locations[i].activity[j]])
        //console.log("\tActivity1 ID: ", activity1Id.insertId)
        let insertActivity1ConnectAcitivity2 = await db.query('INSERT INTO LocationConnectActivity(`entryId`, `a1`) VALUES(' + entryId.insertId + ',' + activity1Id.insertId + ')')
      }
    }
  }

  let lastFileUpload = await db.query("INSERT INTO `userLastUpload`(`date`,`userId`) VALUES('" + timestamp + "', '" + userObject.userId + "')")



  try {
    fs.unlinkSync(path.resolve(__dirname, "../public/uploads/1.json"))
    console.log('removed!!')
    //file removed
  } catch (err) {
    console.error(err)
  }
  res.send("Upload Succefully");
  console.log("The End!");
})


module.exports = router;







