const express = require('express');
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const router = express.Router();

router.use(express.json());
router.use(bodyParser());



router.get('/', function (req, res) {
    res.render('../views/index.ejs')
  });


  //accepts the username and the password from the user, with the POST method.
  //encrypts the password, and sends it back to the user.
router.post('/', async function(req, res){
  try{
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
  var v = {username: req.body.username, pa: hashedPassword}
  res.status(201).send(v);
  }
  catch{
    res.status(500)
  }
});

// //check if given password maches saved password
// if(await bcrypt.compare(req.body.password, savedPassword));

module.exports = router;
