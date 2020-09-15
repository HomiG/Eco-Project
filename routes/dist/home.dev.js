'use strict';

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var GeoPoint = require('geopoint');

var _require = require('../public/js/myGeographicalModules'),
    inRangeOfRect = _require.inRangeOfRect,
    geopointToMyPoint = _require.geopointToMyPoint;

var convertQuerryToHeatmapObject = require('../public/js/convertQuerryToHeatmapObject');

var express = require('express');

var session = require('express-session');

var multer = require('multer');

var path = require("path");

var bodyParser = require('body-parser');

var bcrypt = require('bcrypt');

var router = express.Router();

var connection = require('../config/database.js');

var makeDb = require('../config/db.js');

var mysql = require('mysql');

var crypto = require('crypto');

var assert = require('assert');

var doAsync = require('doasync');

var fs = require('fs');

var ejs = require('ejs');

var util = require('util');

var upload = require('express-fileupload');

var _require2 = require('../public/js/encryptDecrypt'),
    encrypt = _require2.encrypt,
    decrypt = _require2.decrypt;

var _require3 = require('console'),
    timeStamp = _require3.timeStamp;

var _require4 = require('querystring'),
    stringify = _require4.stringify;

var _require5 = require('jquery'),
    type = _require5.type,
    data = _require5.data;

var _require6 = require('path'),
    parse = _require6.parse;

var _require7 = require('constants'),
    SSL_OP_SSLEAY_080_CLIENT_DH_BUG = _require7.SSL_OP_SSLEAY_080_CLIENT_DH_BUG;

router.use(bodyParser.urlencoded({
  extended: false
}));
router.use(bodyParser.json());
router.use(express.json());
router.use(bodyParser());
router.use(upload());
router.use(session({
  secret: 'ssshhhhh'
}));
var sess;
router.get('/', function (req, res) {
  res.render('../views/index.ejs');
});
router.get('/upload', checkAuth, function (req, res) {
  res.render('../views/upload.ejs');
});
router.post('/logout', checkAuth, function (req, res) {
  req.session.destroy();
  res.redirect('/');
}); //accepts the username and the password from the user, with the POST method.
//encrypts the password, and sends it back to the user.

router.post('/signup', function _callee(req, res) {
  var salt, hashedPassword, user;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(bcrypt.genSalt());

        case 3:
          salt = _context.sent;
          _context.next = 6;
          return regeneratorRuntime.awrap(bcrypt.hash(req.body.password, salt));

        case 6:
          hashedPassword = _context.sent;
          user = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            username: req.body.firstname + ' ' + req.body.lastname,
            password: hashedPassword,
            userId: encrypt(req.body.email, req.body.password),
            email: req.body.email
          };
          console.log(user);
          connection.query("INSERT INTO `user` VALUES( " + "'" + user.username + "'," + "'" + user.password + "'," + "'" + user.userId + "'," + "'" + user.email + "', 0)", function (err, result) {
            if (err) {
              if (err.code == 'ER_DUP_ENTRY' || err.errno == 1062) {
                res.status(202).send("Dublicate Entry");
              } else {
                console.log(err.code);
              }
            } else {
              res.status(201).send("COMPLETE SIGN-UP");
            }
          });
          _context.next = 15;
          break;

        case 12:
          _context.prev = 12;
          _context.t0 = _context["catch"](0);
          res.status(500);

        case 15:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 12]]);
});
var userObject = {
  username: '',
  email: '',
  userId: 0,
  ecoscore: 0,
  admin: 0
};

function checkAuth(req, res, next) {
  return regeneratorRuntime.async(function checkAuth$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          if (!req.session.userId) {
            res.send('You are not logged in, please login first in order to view this page');
          } else {
            next();
          }

        case 1:
        case "end":
          return _context2.stop();
      }
    }
  });
}

function checkAdmin(req, res, next) {
  if (!userObject.admin) {
    res.send('You are not authorised to view this page');
  } else {
    next();
  }
}

router.get('/download/', function (req, res) {
  res.download(__dirname + "/../public/downloads/hey.csv", "hey.csv");
});
router.post('/login', function (req, res) {
  var loginData = {
    email: req.body.email,
    password: req.body.password,
    userId: encrypt(req.body.email, req.body.password)
  };
  sess = req.session;
  sess.userId = loginData.userId;
  connection.query("SELECT userId, username, admin FROM user WHERE userId= '" + loginData.userId + "'", function (err, result) {
    if (err) throw err;

    if (!result.length) {
      res.status(500).send("You can't Procced, no user Found");
      console.log(result);
    } else {
      console.log(result[0].username);
      userObject.username = result[0].username;
      var admin = result[0].admin;
      userObject.userId = loginData.userId;
      userObject.email = loginData.email;
      userObject.admin = result[0].admin;
      console.log(userObject.userId);

      if (admin) {
        res.redirect('/admin');
      } else {
        res.redirect('/mainpage');
      }
    }
  });
});
router.get('/admin', checkAuth, checkAdmin, function (req, res) {
  res.render('../views/admin.ejs');
});
router.get('/mainPage', checkAuth, function (req, res) {
  res.render('../views/main_page.ejs', {
    x: userObject.username
  });
});
router.get('/statistics', function (req, res) {
  res.render('../views/statistics.ejs');
});
router.post('/uploadJson', function (req, res) {
  if (req.files) {
    var file = req.files.file;
    var filename = '1.json';
    console.log(filename); //File Gets Overwriten 

    file.mv('./public/uploads/' + filename, function (err) {
      if (err) {
        res.send(err);
      } else {
        res.send('File uploaded!');
      }
    });
  }
});
router.get('/leaderboard', function (req, res) {
  res.render('../views/leaderboard.ejs');
});
router.post('/leaderboard', function _callee2(req, res) {
  var db, todayMonth, eareseCurrentLeaderBoard, updateCurrentMonth, getEcoscores, currentUserEcoscore, arrayColumn, outputData, ecoscoreObject;
  return regeneratorRuntime.async(function _callee2$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          db = makeDb();
          todayMonth = req.body.todayMonth;
          _context3.next = 4;
          return regeneratorRuntime.awrap(db.query('truncate table userVehicleScore'));

        case 4:
          eareseCurrentLeaderBoard = _context3.sent;
          _context3.next = 7;
          return regeneratorRuntime.awrap(db.query('truncate table userWalkingScore'));

        case 7:
          eareseCurrentLeaderBoard = _context3.sent;
          _context3.next = 10;
          return regeneratorRuntime.awrap(db.query('truncate table userecoscore'));

        case 10:
          eareseCurrentLeaderBoard = _context3.sent;
          _context3.next = 13;
          return regeneratorRuntime.awrap(db.query('UPDATE lastMonth set startingDate = ' + todayMonth));

        case 13:
          updateCurrentMonth = _context3.sent;
          _context3.next = 16;
          return regeneratorRuntime.awrap(db.query('SELECT user.username, ecoscore FROM userEcoscore INNER JOIN user ON user.userId = userEcoscore.userId ORDER BY ecoscore DESC LIMIT 3'));

        case 16:
          getEcoscores = _context3.sent;
          _context3.next = 19;
          return regeneratorRuntime.awrap(db.query('SELECT user.username, ecoscore FROM userEcoscore INNER JOIN user ON user.userId = userEcoscore.userId WHERE user.userId = \'' + userObject.userId + '\''));

        case 19:
          currentUserEcoscore = _context3.sent;
          console.log(getEcoscores);
          console.log(currentUserEcoscore);

          arrayColumn = function arrayColumn(arr, n) {
            return arr.map(function (x) {
              return x[n];
            });
          }; // Function to get Column N of 2D array.


          outputData = getEcoscores.map(Object.values); // Converting Array of Objects into Array of Arrays

          ecoscoreObject = {
            names: arrayColumn(outputData, 0),
            //Get the names 
            scores: arrayColumn(outputData, 1) //Get the Scores Coresponding

          }; // CHECK IF ECOSCORE RESULT IS EMPTY

          if (!getEcoscores.length == 0) {
            if (!currentUserEcoscore[0]) {
              currentUserEcoscore = [];
              currentUserEcoscore.push({
                username: userObject.username,
                ecoscore: 0
              }); // currentUserEcoscore[0].ecoscore=0;
              // currentUserEcoscore[0].username = userObject.username;
            } // CHECK IF USER IS IN THE TOP 3, IF NOT ADD HIM AS THE EXTRA ELEMENT


            if (!ecoscoreObject['names'].includes(currentUserEcoscore[0].username)) {
              ecoscoreObject['names'].push(currentUserEcoscore[0].username);
              ecoscoreObject['scores'].push(currentUserEcoscore[0].ecoscore);
            }
          }

          console.log(ecoscoreObject);
          res.send(ecoscoreObject);

        case 28:
        case "end":
          return _context3.stop();
      }
    }
  });
});
router.post('/ecocharts', checkAuth, function _callee3(req, res) {
  var result, db, hey1, hey2, results, lastMonth, m, lastYear, lastFileUpload, firstDate, lastDate, walkingMonth, vehicleMonth, walkingYear, bicycleYear, vehicleYear, i, d, data;
  return regeneratorRuntime.async(function _callee3$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          db = makeDb();
          console.log("Hey I am in");
          lastMonth = new Date();
          m = lastMonth.getMonth();
          lastMonth.setMonth(lastMonth.getMonth() - 1); // If still in same month, set date to last day of 
          // previous month

          if (lastMonth.getMonth() == m) lastMonth.setDate(0);
          lastMonth.setHours(0, 0, 0);
          lastMonth.setMilliseconds(0);
          lastMonth = lastMonth;
          lastYear = new Date();
          lastYear.setFullYear(lastYear.getFullYear() - 1);
          lastYear = lastYear;
          console.log(lastYear);
          _context4.next = 15;
          return regeneratorRuntime.awrap(db.query("SELECT type, activity1.timestampMs  FROM entry " + "INNER JOIN locationconnectactivity on entry.entryId=locationconnectactivity.entryId " + "INNER JOIN activity1 on activity1.aa1=locationconnectactivity.a1 " + "WHERE entry.userId='" + userObject.userId + "'"));

        case 15:
          results = _context4.sent;
          _context4.next = 18;
          return regeneratorRuntime.awrap(db.query('SELECT date FROM userLastUpload WHERE userId = \'' + userObject.userId + '\' ORDER BY date ASC LIMIT 1'));

        case 18:
          lastFileUpload = _context4.sent;
          console.log(lastFileUpload[0].date);
          firstDate = new Date();
          lastDate = new Date(0);
          walkingMonth = 0;
          vehicleMonth = 1;
          walkingYear = 0;
          bicycleYear = 0;
          vehicleYear = 0;

          for (i = 0; i < results.length; i++) {
            d = new Date(parseInt(results[i].timestampMs));

            if (d > lastDate) {
              lastDate = d;
            }

            if (d < firstDate) {
              firstDate = d;
            }

            if (d > lastYear) {
              if (results[i].type == 'ON_FOOT') {
                walkingYear++;
              } else if (results[i].type == 'ON_BICYCLE') {
                bicycleYear++;
              } else if (results[i].type == 'IN_VEHICLE') {
                vehicleYear++;
              }

              if (d > lastMonth) {
                if (results[i].type == 'ON_FOOT' || results[i].type == 'ON_BICYCLE') {
                  walkingMonth++;
                } else if (results[i].type == 'IN_VEHICLE') {
                  vehicleMonth++;
                }
              }
            }
          }

          data = {
            firstdate: firstDate,
            lastdate: lastDate,
            ecoscore: walkingMonth / (walkingMonth + vehicleMonth),
            walking: walkingYear,
            bicycle: bicycleYear,
            vehicle: vehicleYear,
            lastFileUpload: lastFileUpload[0].date
          };
          res.send(data);

        case 30:
        case "end":
          return _context4.stop();
      }
    }
  });
});
router.get('/radar', checkAuth, function (req, res) {
  res.render('../views/radar.ejs');
});
router.get('/charts', checkAuth, function (req, res) {
  res.render('../views/ecocharts.ejs');
});
router.post('/upload', checkAuth, function (req, res) {
  console.log(req.files);
  res.send("DONE");
});
router.post('/export', function _callee4(req, res) {
  var getKeyByValue, dayStringToNumber, mode, dates, checkboxes, tickedCheckboxes, choices, emptyFields, calibrateDatesForDatabaseFiltering, JsonToCsv, JSONtoXML, encloseWithinQuotes, stringForSQLQuery, db, query, i, dataset, currentTimestamp, obje, csv;
  return regeneratorRuntime.async(function _callee4$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          JSONtoXML = function _ref5(obj) {
            var xml = '';

            for (var prop in obj) {
              xml += obj[prop] instanceof Array ? '' : "<" + prop + ">";

              if (obj[prop] instanceof Array) {
                for (var array in obj[prop]) {
                  xml += "<" + prop + ">";
                  xml += OBJtoXML(new Object(obj[prop][array]));
                  xml += "</" + prop + ">";
                }
              } else if (_typeof(obj[prop]) == "object") {
                xml += OBJtoXML(new Object(obj[prop]));
              } else {
                xml += obj[prop];
              }

              xml += obj[prop] instanceof Array ? '' : "</" + prop + ">";
            }

            var xml = xml.replace(/<\/?[0-9]{1,}>/g, '');
            return xml;
          };

          JsonToCsv = function _ref4(jsonData) {
            var items = jsonData;

            var replacer = function replacer(key, value) {
              return value === null ? ' ' : value;
            }; // specify how you want to handle null values here


            var header = Object.keys(items[0]);
            var csv = items.map(function (row) {
              return header.map(function (fieldName) {
                return JSON.stringify(row[fieldName], replacer);
              }).join(',');
            });
            csv.unshift(header.join(','));
            csv = csv.join('\r\n');
            return csv;
          };

          calibrateDatesForDatabaseFiltering = function _ref3(dates, emptyFields) {
            for (var i = 0; i < emptyFields.length; i++) {
              if (emptyFields[i] == 'fromDate') {
                // check if from is empty
                dates[emptyFields[i]] = 1900;
              } else if (emptyFields[i] == 'untilDate') {
                // check if until date is empty 
                dates[emptyFields[i]] = 2200;
              } else if (emptyFields[i] == 'fromMonth') {
                // check if from month is empty 
                dates[emptyFields[i]] = 0;
              } else if (emptyFields[i] == 'untilMonth') {
                // check if until Month is empty 
                dates[emptyFields[i]] = 11;
              } else if (emptyFields[i] == 'fromDay') {
                // check if from day is empty 
                dates[emptyFields[i]] = 0;
              } else if (emptyFields[i] == 'untilDay') {
                // check if until day is empty 
                dates[emptyFields[i]] = 6;
              } else if (emptyFields[i] == 'fromTime') {
                // check if from time is empty 
                dates[emptyFields[i]] = 0;
              } else if (emptyFields[i] == 'untilTime') {
                // check if until time is empty 
                dates[emptyFields[i]] = 23;
              }
            }

            if (!emptyFields.includes('fromDate')) {
              dates['fromDate'] = parseInt(dates['fromDate']);
            }

            if (!emptyFields.includes('untilDate')) {
              dates['untilDate'] = parseInt(dates['untilDate']);
            }

            if (!emptyFields.includes('fromMonth')) {
              dates['fromMonth'] = dates['fromMonth'] - 1;
            }

            if (!emptyFields.includes('untilMonth')) {
              dates['untilMonth'] = dates['untilMonth'] - 1;
            }

            if (!emptyFields.includes('fromDay')) {
              dates['fromDay'] = dayStringToNumber(dates['fromDay']);
            }

            if (!emptyFields.includes('untilDay')) {
              dates['untilDay'] = dayStringToNumber(dates['untilDay']);
            }

            if (!emptyFields.includes('fromTime')) {
              dates['fromTime'] = parseInt(dates['fromTime']);
            }

            if (!emptyFields.includes('untilTime')) {
              dates['untilTime'] = parseInt(dates['untilTime']);
            }
          };

          dayStringToNumber = function _ref2(dayString) {
            var weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return weekday.indexOf(dayString);
          };

          getKeyByValue = function _ref(object, value) {
            return Object.keys(object).filter(function (key) {
              return object[key] === value;
            });
          };

          mode = req.body.mode;
          dates = JSON.parse(req.body.dates);
          checkboxes = JSON.parse(req.body.checkboxes);
          tickedCheckboxes = getKeyByValue(checkboxes, true);
          choices = req.body.choices;
          console.log('chose:', choices); // console.log(mode);

          console.log(dates); // Get the fields from the Date object, that have to value

          emptyFields = getKeyByValue(dates, ''); // Checks if what has came into the database is empty and if so
          // Substracts 1 on MONTHS AND DAYS(Monday, Tuesday...)
          // Parse Strings into integes for later comparison
          //

          calibrateDatesForDatabaseFiltering(dates, emptyFields);
          console.log(dates);
          // ----- CONVERTING THE ARRAY OF CHECKBOXES INTO WHAT TYPES TO CALL FROM THE DATABASE! ----- //
          encloseWithinQuotes = "'" + tickedCheckboxes.join("','") + "'";
          stringForSQLQuery = encloseWithinQuotes.replace(/,/g, ' OR TYPE = '); // ----- CONVERTING THE ARRAY OF CHECKBOXES INTO WHAT TYPES TO CALL FROM THE DATABASE! ----- //

          db = makeDb();
          _context5.t0 = parseInt(mode);
          _context5.next = _context5.t0 === 2 ? 21 : _context5.t0 === 3 ? 25 : _context5.t0 === 4 ? 29 : 33;
          break;

        case 21:
          _context5.next = 23;
          return regeneratorRuntime.awrap(db.query(' SELECT heading, activity1.type, activity1.timestampMs, verticalAccuracy, velocity, accuracy, longitudeE7, latitudeE7, altitude, entry.timestampMs, entry.userId as id FROM entry ' + 'INNER JOIN locationconnectactivity on entry.entryId=locationconnectactivity.entryId ' + 'INNER JOIN activity1 on activity1.aa1=locationconnectactivity.a1'));

        case 23:
          query = _context5.sent;
          return _context5.abrupt("break", 33);

        case 25:
          _context5.next = 27;
          return regeneratorRuntime.awrap(db.query('SELECT heading, activity1.type, activity1.timestampMs, verticalAccuracy, velocity, accuracy, longitudeE7, latitudeE7, altitude, entry.timestampMs, entry.userId as id   FROM `entry` ' + 'INNER JOIN activity1 on activity1.aa1=entry.entryId ' + 'WHERE type = ' + stringForSQLQuery));

        case 27:
          query = _context5.sent;
          return _context5.abrupt("break", 33);

        case 29:
          _context5.next = 31;
          return regeneratorRuntime.awrap(db.query('SELECT heading, activity1.type, activity1.timestampMs, verticalAccuracy, velocity, accuracy, longitudeE7, latitudeE7, altitude, entry.timestampMs, entry.userId as id  FROM `entry` ' + 'INNER JOIN activity1 on activity1.aa1=entry.entryId ' + 'WHERE type = ' + stringForSQLQuery));

        case 31:
          query = _context5.sent;
          return _context5.abrupt("break", 33);

        case 33:
          dataset = [];

          for (i = 0; i < query.length; i++) {
            currentTimestamp = new Date(parseInt(query[i].timestampMs)); //console.log(currentTimestamp.getYear() + 1900 + ' >= ' + dates.dateForm + "   " + (currentTimestamp.getYear() + 1900) + '  <=  ' + dates.untilDate);

            if (currentTimestamp.getYear() + 1900 >= dates.fromDate && currentTimestamp.getYear() + 1900 <= dates.untilDate) {
              // Check Year
              // console.log("Pass 1");
              // console.log((currentTimestamp.getMonth()) +'  >=  '+ dates.fromMonth  + "  ++  " + (currentTimestamp.getMonth()) + '  <=  ' + dates.untilMonth);
              if (currentTimestamp.getMonth() >= dates.fromMonth && currentTimestamp.getMonth() <= dates.untilMonth) {
                // Check Month
                // console.log("Pass 2");
                if (currentTimestamp.getDay() >= dates.fromDay && currentTimestamp.getDay() <= dates.untilDay) {
                  // Check Day
                  // console.log("Pass 3");
                  if (currentTimestamp.getHours() >= dates.fromTime && currentTimestamp.getHours() <= dates.untilTime) {
                    // Check Check Time
                    // console.log("Pass 4");
                    dataset.push(query[i]);
                  }
                }
              }
            }
          }

          obje = {
            data: dataset
          }; //console.log(JSON.parse(JSON.stringify(obje)))

          _context5.t1 = choices;
          _context5.next = _context5.t1 === 'JSON' ? 39 : _context5.t1 === "CSV" ? 42 : 45;
          break;

        case 39:
          console.log("JSON"); //fs.writeFileSync(__dirname + "/../public/downloads/hey.json", JSON.stringify({ A: 1, b: 2 }))

          fs.writeFileSync(__dirname + "/../public/downloads/hey.json", JSON.stringify(obje));
          return _context5.abrupt("break", 45);

        case 42:
          csv = JsonToCsv(dataset);
          fs.writeFileSync(__dirname + "/../public/downloads/hey.csv", csv);
          return _context5.abrupt("break", 45);

        case 45:
          res.send(dataset);

        case 46:
        case "end":
          return _context5.stop();
      }
    }
  });
});
router.get('/troll', function _callee5(req, res) {
  var sensitiveRect, db, bulkInsert, user, userArray, entryId, activity1Id, activity2Id, i, j, k, n, patrasCenter, pointToBeInserted, upperleftBound, lowerDownBound, insertedPoint, insertActivity1ConnectAcitivity2, _insertActivity1ConnectAcitivity;

  return regeneratorRuntime.async(function _callee5$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          bulkInsert = function _ref6(db, table, objectArray) {
            var keys = Object.keys(objectArray[0]);

            if (keys.includes("activity")) {
              // Checking if 
              keys.splice(keys.indexOf('activity'), 1);
            }

            var values = objectArray.map(function (obj) {
              return keys.map(function (key) {
                return obj[key];
              });
            });
            var sql = 'INSERT INTO ' + table + ' (' + keys.join(',') + ') VALUES ?';
            return db.query(sql, [values]);
          };

          // Sensitive Rectangular sent with the Ajax Post 
          sensitiveRect = {
            _northEastLat: req.body._northEastLat,
            _northEastLng: req.body._northEastLng,
            _southWestLat: req.body._southWestLat,
            _southWestLng: req.body._southWestLng
          }; //This is for Running the Code Async

          db = makeDb();
          user = {
            _id: null,
            _data: null,
            createUser: function createUser(id, data) {
              this._id = id;
              this._data = data;
            }
          };
          userArray = []; //userArray.push(new user.createUser('07b04ece12bb92f3ccd70e07d0c0741ded0eeee605db11171f20d85d40ab9461',require('../Data/Doug/Location History.json')));
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

          patrasCenter = new GeoPoint(38.230462, 21.753150);
          n = 0;

        case 7:
          if (!(n < userArray.length)) {
            _context6.next = 45;
            break;
          }

          i = 0;

        case 9:
          if (!(i < userArray[n]._data.locations.length)) {
            _context6.next = 42;
            break;
          }

          pointToBeInserted = new GeoPoint(userArray[n]._data.locations[i].latitudeE7 * Math.pow(10, -7), userArray[n]._data.locations[i].longitudeE7 * Math.pow(10, -7)); // If the point to be inserted out of 10Km Patras Cetner, Skip this Spot

          if (!(patrasCenter.distanceTo(pointToBeInserted, true) > 10)) {
            _context6.next = 13;
            break;
          }

          return _context6.abrupt("continue", 39);

        case 13:
          if (!inRangeOfRect(sensitiveRect, geopointToMyPoint(pointToBeInserted))) {
            _context6.next = 15;
            break;
          }

          return _context6.abrupt("continue", 39);

        case 15:
          userArray[n]._data.locations[i].userId = userArray[n]._id;
          _context6.next = 18;
          return regeneratorRuntime.awrap(bulkInsert(db, 'entry', [userArray[n]._data.locations[i]]));

        case 18:
          entryId = _context6.sent;

          if (!('activity' in userArray[n]._data.locations[i])) {
            _context6.next = 39;
            break;
          }

          j = 0;

        case 21:
          if (!(j < userArray[n]._data.locations[i].activity.length)) {
            _context6.next = 39;
            break;
          }

          _context6.next = 24;
          return regeneratorRuntime.awrap(bulkInsert(db, 'activity1', [userArray[n]._data.locations[i].activity[j]]));

        case 24:
          activity1Id = _context6.sent;
          //console.log("\tActivity1 ID: ", activity1Id.insertId)
          insertActivity1ConnectAcitivity2 = db.query('INSERT INTO LocationConnectActivity(`entryId`, `a1`) VALUES(' + entryId.insertId + ',' + activity1Id.insertId + ')');

          if (!('activity' in userArray[n]._data.locations[i].activity[j])) {
            _context6.next = 36;
            break;
          }

          k = 0;

        case 28:
          if (!(k < userArray[n]._data.locations[i].activity[j].activity.length)) {
            _context6.next = 36;
            break;
          }

          _context6.next = 31;
          return regeneratorRuntime.awrap(bulkInsert(db, 'activity2', [userArray[n]._data.locations[i].activity[j].activity[k]]));

        case 31:
          activity2Id = _context6.sent;
          //console.log("\t\tActivity2 ID: ", activity2Id.insertId)
          _insertActivity1ConnectAcitivity = db.query('INSERT INTO Activity1ConnectActivity2(`a1`, `a2`) VALUES(' + activity1Id.insertId + ',' + activity2Id.insertId + ')');

        case 33:
          k++;
          _context6.next = 28;
          break;

        case 36:
          j++;
          _context6.next = 21;
          break;

        case 39:
          i++;
          _context6.next = 9;
          break;

        case 42:
          n++;
          _context6.next = 7;
          break;

        case 45:
        case "end":
          return _context6.stop();
      }
    }
  });
});
router.get('/drawfullheatmap', function _callee6(req, res) {
  var db, allHeatmapData, objectForHeatmap;
  return regeneratorRuntime.async(function _callee6$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          db = makeDb();
          _context7.next = 3;
          return regeneratorRuntime.awrap(db.query('SELECT latitudeE7, longitudeE7 FROM `entry` '));

        case 3:
          allHeatmapData = _context7.sent;
          objectForHeatmap = convertQuerryToHeatmapObject(allHeatmapData);
          res.send(objectForHeatmap);

        case 6:
        case "end":
          return _context7.stop();
      }
    }
  });
});
router.post('/drawSpecifiedHeatmap', function _callee7(req, res) {
  var getKeyByValue, dayStringToNumber, mode, dates, checkboxes, tickedCheckboxes, choices, emptyFields, calibrateDatesForDatabaseFiltering, encloseWithinQuotes, stringForSQLQuery, db, query, i, rangedLocations, currentTimestamp, objectTobeSendToFrontEnd;
  return regeneratorRuntime.async(function _callee7$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          calibrateDatesForDatabaseFiltering = function _ref9(dates, emptyFields) {
            for (var i = 0; i < emptyFields.length; i++) {
              if (emptyFields[i] == 'fromDate') {
                // check if from is empty
                dates[emptyFields[i]] = 1900;
              } else if (emptyFields[i] == 'untilDate') {
                // check if until date is empty 
                dates[emptyFields[i]] = 2200;
              } else if (emptyFields[i] == 'fromMonth') {
                // check if from month is empty 
                dates[emptyFields[i]] = 0;
              } else if (emptyFields[i] == 'untilMonth') {
                // check if until Month is empty 
                dates[emptyFields[i]] = 11;
              } else if (emptyFields[i] == 'fromDay') {
                // check if from day is empty 
                dates[emptyFields[i]] = 0;
              } else if (emptyFields[i] == 'untilDay') {
                // check if until day is empty 
                dates[emptyFields[i]] = 6;
              } else if (emptyFields[i] == 'fromTime') {
                // check if from time is empty 
                dates[emptyFields[i]] = 0;
              } else if (emptyFields[i] == 'untilTime') {
                // check if until time is empty 
                dates[emptyFields[i]] = 23;
              }
            }

            if (!emptyFields.includes('fromDate')) {
              dates['fromDate'] = parseInt(dates['fromDate']);
            }

            if (!emptyFields.includes('untilDate')) {
              dates['untilDate'] = parseInt(dates['untilDate']);
            }

            if (!emptyFields.includes('fromMonth')) {
              dates['fromMonth'] = dates['fromMonth'] - 1;
            }

            if (!emptyFields.includes('untilMonth')) {
              dates['untilMonth'] = dates['untilMonth'] - 1;
            }

            if (!emptyFields.includes('fromDay')) {
              dates['fromDay'] = dayStringToNumber(dates['fromDay']);
            }

            if (!emptyFields.includes('untilDay')) {
              dates['untilDay'] = dayStringToNumber(dates['untilDay']);
            }

            if (!emptyFields.includes('fromTime')) {
              dates['fromTime'] = parseInt(dates['fromTime']);
            }

            if (!emptyFields.includes('untilTime')) {
              dates['untilTime'] = parseInt(dates['untilTime']);
            }
          };

          dayStringToNumber = function _ref8(dayString) {
            var weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return weekday.indexOf(dayString);
          };

          getKeyByValue = function _ref7(object, value) {
            return Object.keys(object).filter(function (key) {
              return object[key] === value;
            });
          };

          console.log(req.body); // Get ARRAY of key given value If Multiple keys have Same value 

          mode = req.body.mode;
          dates = JSON.parse(req.body.dates);
          checkboxes = JSON.parse(req.body.checkboxes);
          tickedCheckboxes = getKeyByValue(checkboxes, true);
          choices = req.body.choices; // console.log(mode);

          console.log(dates); //console.log(checkboxes);
          // fromDate: '2015',
          //   untilDate: '2025',
          //     fromMonth: '01',
          //       untilMonth: '12',
          //         fromDay: 'Monday',
          //           untilDay: 'Sunday',
          //             fromTime: '',
          //               untilTime: ''
          // Get the fields from the Date object, that have to value

          emptyFields = getKeyByValue(dates, ''); // Checks if what has came into the database is empty and if so
          // Substracts 1 on MONTHS AND DAYS(Monday, Tuesday...)
          // Parse Strings into integes for later comparison
          //

          calibrateDatesForDatabaseFiltering(dates, emptyFields);
          console.log(dates); // ----- CONVERTING THE ARRAY OF CHECKBOXES INTO WHAT TYPES TO CALL FROM THE DATABASE! ----- //

          encloseWithinQuotes = "'" + tickedCheckboxes.join("','") + "'";
          stringForSQLQuery = encloseWithinQuotes.replace(/,/g, ' OR TYPE = '); // ----- CONVERTING THE ARRAY OF CHECKBOXES INTO WHAT TYPES TO CALL FROM THE DATABASE! ----- //

          db = makeDb();
          _context8.t0 = parseInt(mode);
          _context8.next = _context8.t0 === 2 ? 19 : _context8.t0 === 3 ? 23 : _context8.t0 === 4 ? 27 : 31;
          break;

        case 19:
          _context8.next = 21;
          return regeneratorRuntime.awrap(db.query(' SELECT latitudeE7, longitudeE7, activity1.timestampMs FROM entry ' + 'INNER JOIN locationconnectactivity on entry.entryId=locationconnectactivity.entryId ' + 'INNER JOIN activity1 on activity1.aa1=locationconnectactivity.a1'));

        case 21:
          query = _context8.sent;
          return _context8.abrupt("break", 31);

        case 23:
          _context8.next = 25;
          return regeneratorRuntime.awrap(db.query('SELECT entry.latitudeE7, entry.longitudeE7 FROM `entry` ' + 'INNER JOIN activity1 on activity1.aa1=entry.entryId ' + 'WHERE type = ' + stringForSQLQuery));

        case 25:
          query = _context8.sent;
          return _context8.abrupt("break", 31);

        case 27:
          _context8.next = 29;
          return regeneratorRuntime.awrap(db.query('SELECT entry.latitudeE7, entry.longitudeE7, activity1.timestampMs FROM `entry` ' + 'INNER JOIN activity1 on activity1.aa1=entry.entryId ' + 'WHERE type = ' + stringForSQLQuery));

        case 29:
          query = _context8.sent;
          return _context8.abrupt("break", 31);

        case 31:
          // ENDING HERE I HAVE GOT FROM THE DATABASE THE LOCATION having SPECIFIC ACTIVITIES (if asked)
          // NOW TIME (if asked) has to be DETERMINED!
          console.log("Query Result ", query, '\n END');
          rangedLocations = [];

          for (i = 0; i < query.length; i++) {
            currentTimestamp = new Date(parseInt(query[i].timestampMs)); //console.log(currentTimestamp.getYear() + 1900 + ' >= ' + dates.dateForm + "   " + (currentTimestamp.getYear() + 1900) + '  <=  ' + dates.untilDate);

            if (currentTimestamp.getYear() + 1900 >= dates.fromDate && currentTimestamp.getYear() + 1900 <= dates.untilDate) {
              // Check Year
              // console.log("Pass 1");
              // console.log((currentTimestamp.getMonth()) +'  >=  '+ dates.fromMonth  + "  ++  " + (currentTimestamp.getMonth()) + '  <=  ' + dates.untilMonth);
              if (currentTimestamp.getMonth() >= dates.fromMonth && currentTimestamp.getMonth() <= dates.untilMonth) {
                // Check Month
                // console.log("Pass 2");
                if (currentTimestamp.getDay() >= dates.fromDay && currentTimestamp.getDay() <= dates.untilDay) {
                  // Check Day
                  // console.log("Pass 3");
                  if (currentTimestamp.getHours() >= dates.fromTime && currentTimestamp.getHours() <= dates.untilTime) {
                    // Check Check Time
                    // console.log("Pass 4");
                    rangedLocations.push(query[i]);
                  }
                }
              }
            }
          }

          objectTobeSendToFrontEnd = convertQuerryToHeatmapObject(rangedLocations);
          res.send(objectTobeSendToFrontEnd);

        case 36:
        case "end":
          return _context8.stop();
      }
    }
  });
});
router.post('/deleteData', function _callee8(req, res) {
  var db, deleteData;
  return regeneratorRuntime.async(function _callee8$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          db = makeDb();
          console.log("HERE!");
          _context9.next = 4;
          return regeneratorRuntime.awrap(db.query('CALL deleteData()'));

        case 4:
          deleteData = _context9.sent;
          console.log(deleteData);
          res.send("Database data Deleted!");

        case 7:
        case "end":
          return _context9.stop();
      }
    }
  });
});
router.post('/radarRangeDates', function _callee9(req, res) {
  var dateForm, db, radarDates, i, statsObject, statsObjectAr, tipos, calcDays, finalObject, objectForHeatmap;
  return regeneratorRuntime.async(function _callee9$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          calcDays = function _ref10(Object, type) {
            var days = [0, 0, 0, 0, 0, 0, 0];
            var hours = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
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
            };
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
            };
            var statData = {
              day: day,
              hour: hour
            };
            return statData;
          };

          dateForm = req.body; //This is for Running the Code Async

          db = makeDb();
          console.log(dateForm.until, "  ", dateForm.since, "--", userObject.userId);
          _context10.next = 6;
          return regeneratorRuntime.awrap(db.query('SELECT type, activity1.timestampMs FROM entry INNER JOIN locationconnectactivity on entry.entryId=locationconnectactivity.entryId INNER JOIN activity1 on activity1.aa1=locationconnectactivity.a1 WHERE activity1.timestampMs > ' + dateForm.since + ' AND activity1.timestampMs < ' + dateForm.until + ' AND userId = \'' + userObject.userId + '\''));

        case 6:
          radarDates = _context10.sent;
          statsObjectAr = [];
          tipos = {
            vehicle: 0,
            foot: 0,
            tilting: 0,
            still: 0,
            bicycle: 0,
            unknown: 0
          };
          i = 0;

        case 10:
          if (!(i < radarDates.length)) {
            _context10.next = 31;
            break;
          }

          statsObject = {
            type: radarDates[i].type,
            time: radarDates[i].timestampMs
          };
          statsObjectAr.push(statsObject);
          _context10.t0 = statsObject.type;
          _context10.next = _context10.t0 === 'IN_VEHICLE' ? 16 : _context10.t0 === 'ON_FOOT' ? 18 : _context10.t0 === 'TILTING' ? 20 : _context10.t0 === 'STILL' ? 22 : _context10.t0 === 'ON_BICYCLE' ? 24 : _context10.t0 === 'UNKNOWN' ? 26 : 28;
          break;

        case 16:
          tipos.vehicle++;
          return _context10.abrupt("break", 28);

        case 18:
          tipos.foot++;
          return _context10.abrupt("break", 28);

        case 20:
          tipos.tilting++;
          return _context10.abrupt("break", 28);

        case 22:
          tipos.still++;
          return _context10.abrupt("break", 28);

        case 24:
          tipos.bicycle++;
          return _context10.abrupt("break", 28);

        case 26:
          tipos.unknown++;
          return _context10.abrupt("break", 28);

        case 28:
          i++;
          _context10.next = 10;
          break;

        case 31:
          finalObject = {
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
          }; //console.log(locationsObjectArr)
          // console.log(finalObject['bicycle']['hours']);

          objectForHeatmap = convertQuerryToHeatmapObject(radarDates); //console.log(type);

          res.send(finalObject);

        case 34:
        case "end":
          return _context10.stop();
      }
    }
  });
});
router.post('/rangeDates', function _callee10(req, res) {
  var dateForm, db, rangedDates, i, locationsObject, objectForHeatmap, locationsObjectArr;
  return regeneratorRuntime.async(function _callee10$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          dateForm = req.body; //This is for Running the Code Async

          db = makeDb();
          console.log(dateForm.until, "  ", dateForm.since, "--", userObject.userId);
          console.log(dateForm);
          _context11.next = 6;
          return regeneratorRuntime.awrap(db.query('SELECT latitudeE7, longitudeE7 FROM entry  WHERE entry.timestampMs > ' + dateForm.since + ' AND entry.timestampMs < ' + dateForm.until + ' AND userId = \'' + userObject.userId + '\''));

        case 6:
          rangedDates = _context11.sent;
          //This is a javascript object that HeatmapJs understands and translate it into colors
          locationsObjectArr = [];

          for (i = 0; i < rangedDates.length; i++) {
            locationsObject = {
              lat: rangedDates[i].latitudeE7 * Math.pow(10, -7),
              lng: rangedDates[i].longitudeE7 * Math.pow(10, -7),
              count: 1
            };
            locationsObjectArr.push(locationsObject);
          } // //console.log(locationsObjectArr)
          // console.log(finalObject['bicycle']['hours']);
          //console.log(type);


          objectForHeatmap = {
            data: locationsObjectArr,
            max: locationsObjectArr.length
          };
          res.send(objectForHeatmap);

        case 11:
        case "end":
          return _context11.stop();
      }
    }
  });
});
router.post('/statistics', function _callee11(req, res) {
  var db, users, allthedata, i, j, k, tipos, counts, usercounts, date, year, calcDays, statData, finalObject;
  return regeneratorRuntime.async(function _callee11$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          calcDays = function _ref11(Object) {
            var days = [0, 0, 0, 0, 0, 0, 0];
            var hours = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            var months = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
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
            };
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
            };
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
            };
            var statData = {
              day: day,
              hour: hour,
              month: month
            };
            return statData;
          };

          //var dateForm = req.body
          //This is for Running the Code Async
          db = makeDb();
          _context12.next = 4;
          return regeneratorRuntime.awrap(db.query('SELECT userId, username from user where admin=0'));

        case 4:
          users = _context12.sent;
          _context12.next = 7;
          return regeneratorRuntime.awrap(db.query('SELECT type , entry.userId as id , activity1.timestampMs as time FROM user INNER JOIN entry ON user.userId=entry.userId INNER JOIN locationconnectactivity on entry.entryId=locationconnectactivity.entryId INNER JOIN activity1 on activity1.aa1=locationconnectactivity.a1 '));

        case 7:
          allthedata = _context12.sent;
          tipos = {
            vehicle: 0,
            feet: 0,
            tilting: 0,
            still: 0,
            bicycle: 0,
            unknown: 0
          };
          counts = {};
          usercounts = {};

          for (j = 0; j < users.length; j++) {
            usercounts[JSON.stringify(users[j].userId)] = {
              username: users[j].username,
              count: 0
            };
          } // console.log(usercounts);
          // console.log(allthedata)


          for (i = 0; i < allthedata.length; i++) {
            usercounts[JSON.stringify(allthedata[i].id)].count++;
            date = allthedata[i].time;
            year = new Date(parseInt(date)).getFullYear();
            counts[year] = 0;
          }

          i = 0;

        case 14:
          if (!(i < allthedata.length)) {
            _context12.next = 34;
            break;
          }

          userObject = {
            name: allthedata[i].username,
            id: allthedata[i].userId
          };
          _context12.t0 = allthedata[i].type;
          _context12.next = _context12.t0 === 'IN_VEHICLE' ? 19 : _context12.t0 === 'ON_FOOT' ? 21 : _context12.t0 === 'TILTING' ? 23 : _context12.t0 === 'STILL' ? 25 : _context12.t0 === 'ON_BICYCLE' ? 27 : _context12.t0 === 'UNKNOWN' ? 29 : 31;
          break;

        case 19:
          tipos.vehicle++;
          return _context12.abrupt("break", 31);

        case 21:
          tipos.feet++;
          return _context12.abrupt("break", 31);

        case 23:
          tipos.tilting++;
          return _context12.abrupt("break", 31);

        case 25:
          tipos.still++;
          return _context12.abrupt("break", 31);

        case 27:
          tipos.bicycle++;
          return _context12.abrupt("break", 31);

        case 29:
          tipos.unknown++;
          return _context12.abrupt("break", 31);

        case 31:
          i++;
          _context12.next = 14;
          break;

        case 34:
          statData = calcDays(allthedata);
          finalObject = {
            type: tipos,
            days: statData.day,
            hours: statData.hour,
            months: statData.month,
            years: counts,
            users: usercounts
          }; //console.log(locationsObjectArr)
          // console.log(finalObject);

          res.send(finalObject);

        case 37:
        case "end":
          return _context12.stop();
      }
    }
  });
});
router.post('/getHeatmap', function _callee12(req, res) {
  var db, rangedDates, objectForHeatmap;
  return regeneratorRuntime.async(function _callee12$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          db = makeDb();
          _context13.next = 3;
          return regeneratorRuntime.awrap(db.query('SELECT latitudeE7, longitudeE7 FROM `entry` WHERE userId = \'' + userObject.userId + '\''));

        case 3:
          rangedDates = _context13.sent;
          objectForHeatmap = convertQuerryToHeatmapObject(rangedDates);
          res.send(objectForHeatmap);

        case 6:
        case "end":
          return _context13.stop();
      }
    }
  });
});
router.post('/test', function _callee13(req, res) {
  var date, timestamp, areas, jsonData, db, bulkInsert, entryId, activity1Id, activity2Id, activityType, i, j, k, patrasCenter, pointToBeInserted, insertActivity1ConnectAcitivity2, lastFileUpload;
  return regeneratorRuntime.async(function _callee13$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          bulkInsert = function _ref12(db, table, objectArray) {
            var keys = Object.keys(objectArray[0]);

            if (keys.includes("activity")) {
              // Checking if 
              keys.splice(keys.indexOf('activity'), 1);
            }

            var values = objectArray.map(function (obj) {
              return keys.map(function (key) {
                return obj[key];
              });
            });
            var sql = 'INSERT INTO ' + table + ' (' + keys.join(',') + ') VALUES ?';
            return db.query(sql, [values]);
          };

          date = new Date();
          timestamp = date.getTime(); // Sensitive Rectangular Array sent with the Ajax Post 

          areas = JSON.parse(req.body.areas); //console.log(areas)

          jsonData = fs.readFileSync(path.resolve(__dirname, "../public/uploads/1.json"));
          jsonData = JSON.parse(jsonData); //console.log(jsonData)

          db = makeDb();
          patrasCenter = new GeoPoint(38.230462, 21.753150);
          i = 0;

        case 9:
          if (!(i < jsonData.locations.length)) {
            _context14.next = 37;
            break;
          }

          pointToBeInserted = new GeoPoint(jsonData.locations[i].latitudeE7 * Math.pow(10, -7), jsonData.locations[i].longitudeE7 * Math.pow(10, -7)); // If the point to be inserted out of 10Km Patras Cetner, Skip this Spot

          if (!(patrasCenter.distanceTo(pointToBeInserted, true) > 10)) {
            _context14.next = 13;
            break;
          }

          return _context14.abrupt("continue", 34);

        case 13:
          if (!inRangeOfRect(areas, geopointToMyPoint(pointToBeInserted))) {
            _context14.next = 16;
            break;
          }

          console.log("POINT IS INSIDE SENSITIVE AREA ");
          return _context14.abrupt("continue", 34);

        case 16:
          jsonData.locations[i].userId = userObject.userId;
          _context14.next = 19;
          return regeneratorRuntime.awrap(bulkInsert(db, 'entry', [jsonData.locations[i]]));

        case 19:
          entryId = _context14.sent;

          if (!('activity' in jsonData.locations[i])) {
            _context14.next = 34;
            break;
          }

          j = 0;

        case 22:
          if (!(j < jsonData.locations[i].activity.length)) {
            _context14.next = 34;
            break;
          }

          //        console.log(jsonData.locations[i].activity[j])
          activityType = Object.values(jsonData.locations[i].activity[j]['activity'][0])[0]; // Get The Activity Type with the Highest Confidence, aka the first one

          jsonData.locations[i].activity[j].type = activityType;
          _context14.next = 27;
          return regeneratorRuntime.awrap(bulkInsert(db, 'activity1', [jsonData.locations[i].activity[j]]));

        case 27:
          activity1Id = _context14.sent;
          _context14.next = 30;
          return regeneratorRuntime.awrap(db.query('INSERT INTO LocationConnectActivity(`entryId`, `a1`) VALUES(' + entryId.insertId + ',' + activity1Id.insertId + ')'));

        case 30:
          insertActivity1ConnectAcitivity2 = _context14.sent;

        case 31:
          j++;
          _context14.next = 22;
          break;

        case 34:
          i++;
          _context14.next = 9;
          break;

        case 37:
          _context14.next = 39;
          return regeneratorRuntime.awrap(db.query("INSERT INTO `userLastUpload`(`date`,`userId`) VALUES('" + timestamp + "', '" + userObject.userId + "')"));

        case 39:
          lastFileUpload = _context14.sent;

          try {
            fs.unlinkSync(path.resolve(__dirname, "../public/uploads/1.json"));
            console.log('removed!!'); //file removed
          } catch (err) {
            console.error(err);
          }

          res.send("Upload Succefully");
          console.log("The End!");

        case 43:
        case "end":
          return _context14.stop();
      }
    }
  });
});
module.exports = router;