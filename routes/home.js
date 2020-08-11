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
      res.render('../views/JSONparsing.ejs');
      console.log(result)
    }
  });



});

// //check if given password maches saved password
// if(await bcrypt.compare(req.body.password, savedPassword));



router.post('/uploadJSON', function(req, res){
  //jsonData = req.body;
  

let jsonData = require('../locationHistory.json');

jsonData = JSON.stringify(jsonData);

  values = []; // array to parse json, for the db

  //console.log(jsonData)
  for(var i=0; i<jsonData.length; i++){
    if(!jsonData[i].activity)
      console.log('no activity');
    else
      console.log('activity');
    
  }
})



module.exports = router;
