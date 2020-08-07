const express = require('express');
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const router = express.Router();
const connection = require('../config/database')
const mysql = require('mysql');

con = mysql.createConnection(connection);


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
      email: req.body.email,
      usaerId: req.body.usaerId
    }

    

    con.connect(function (err) {
      if (err) throw err;
      con.query("INSERT INTO user VALUES(" + user.username + "," + user.password + "," + user.usaerId + "," + user.email + ")",
       function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
      });
    });


    res.status(201).send("COMPLETE SIGN-UP");
  }
  catch{
    res.status(500)
  }
});

// //check if given password maches saved password
// if(await bcrypt.compare(req.body.password, savedPassword));

module.exports = router;
