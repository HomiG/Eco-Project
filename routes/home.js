const express = require('express');
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const router = express.Router();
const connection = require('../config/database.js')
const mysql = require('mysql');
const crypto = require('crypto');
const assert = require('assert');

const {encrypt, decrypt} = require('../encryptDecrypt')

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
        if (err) throw err;
        console.log("1 record inserted");
      });
    res.status(201).send("COMPLETE SIGN-UP");
  }

  catch{
    res.status(500)
  }
});

router.post('/login', function(req, res){



  loginData = {
    email: req.body.email,
    password: req.body.password,
    userId: req.body.userId
  }
 
  userId = encrypt(loginData.email, loginData.password)
  console.log(userId)



  connection.query("SELECT userId FROM user WHERE userId= '" + loginData.password + "'", function(err, result){
    if(err) throw err;
    if(!result.length){
      res.status(500).send("You can't Procced, no user Found");
      console.log(result);
    }  
    else{
      res.status(201).send("Username: " );
      console.log(result)
    }
  });



});

// //check if given password maches saved password
// if(await bcrypt.compare(req.body.password, savedPassword));

module.exports = router;
