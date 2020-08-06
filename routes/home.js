const express = require('express');
const bodyParser = require('body-parser')
const router = express.Router();

router.use(express.json());
router.use(bodyParser());



router.get('/', function (req, res) {
    res.render('../views/index.ejs')
  });


router.post('/', function(req, res){
  var v = {username: req.body.username, pa: req.body.password}
  res.status(201).send(v);
});


module.exports = router;
