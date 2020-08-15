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


const {encrypt, decrypt} = require('../encryptDecrypt');
const { json } = require('express');


router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(express.json());
router.use(bodyParser());



// router.get('/', function (req, res) {
//   res.render('../views/index.ejs')
// });


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
        if(err)
        {
  
          if(err.code == 'ER_DUP_ENTRY' || err.errno == 1062)
          {
            res.status(202).send("Dublicate Entry");
          }
          else{
             console.log('Other error in the query')
          }
  
        }else{
          res.status(201).send("COMPLETE SIGN-UP");
        }
      });
  }

  catch{
    res.status(500)
  }
});

router.post('/login', function(req, res){



  loginData = {
    email: req.body.email,
    password: req.body.password,
    userId: encrypt(req.body.email, req.body.password)
  }
 



  connection.query("SELECT userId FROM user WHERE userId= '" + loginData.userId + "'", function(err, result){
    if(err) throw err;
    if(!result.length){
      res.status(500).send("You can't Procced, no user Found");
      console.log(result);
    }  
    else{
      res.render('../views/leaflet.ejs');
      console.log(result)
    }
  });



});

// //check if given password maches saved password
// if(await bcrypt.compare(req.body.password, savedPassword));














router.get('/', function(req, res){
  

let jsonData = require('../locationHistory.json');


// console.log(jsonData.locations[0].activity[3])

function sizeObj(obj) {
  return Object.keys(obj).length; //tried this but didn't work
}

let cordinates=[];
let activity1=[];
let activity2=[];


for (i = 0; i < jsonData.locations.length; i++) {

  
  cordinates.push([jsonData.locations[i].timestampMs, jsonData.locations[i].latitudeE7, jsonData.locations[i].longitudeE7, jsonData.locations[i].accuracy, jsonData.locations[i].activity]);
 

   for (j = 0; j < /*sizeObj(*/jsonData.locations[i].activity.length/*)*/; j++)
  {
  activity1.push([jsonData.locations[i].activity.timestaMps])
  //   for (k = 0; k < jsonData.locations[i].activity[j].length; k++) {
  //     activity2.push([jsonData.locations[i].activity[j].object[k].type, jsonData.locations[i].activity[j].object[k].confidence])
  // }
  }
}



// console.log(cordinates)
console.log(activity1);
// console.log(activity2)


// connection.query("INSERT INTO `entry`(`timestapMs`, `longtitude`,  `latitude`, `accuracy`) VALUES ?", [cordinates], function(err, result)
// {  
//   if (err) throw err;  
// })


// })


// router.get('/checkMap', function(req, res){
//   res.render('../views/leaflet.ejs')

})


module.exports = router;
