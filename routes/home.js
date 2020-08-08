const express = require('express');
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const router = express.Router();
const connection = require('../config/database.js')
const mysql = require('mysql');


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
      userId: req.body.userId,
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
    username: req.body.username,
    password: req.body.password,
    userId: req.body.userId
  }

  connection.query("SELECT userId FROM user WHERE userId= '" + loginData.userId + "'", function(err, result){
    if(err) throw err;
    if(!result.length)
      res.status(500).send("You can't Procced, no user Found");
    else
      res.status(201).send("Username: " );
  });



});

// //check if given password maches saved password
// if(await bcrypt.compare(req.body.password, savedPassword));

module.exports = router;
