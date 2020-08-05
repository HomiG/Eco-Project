const express = require('express');
const router = require('route');

router.get('/', function (req, res) {
    res.render('/views/index.ejs')
  });

module.exports = router;