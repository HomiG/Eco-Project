const express = require('express');
const bodyParser = require('body-parser')


const router = express.Router();

router.use(bodyParser());



router.get('/', function (req, res) {
    res.render('../views/index.ejs')
  });

  app.post('/', function(req, response){

  });


module.exports = router;
