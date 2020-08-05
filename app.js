var express = require('express');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var path = require('path');




var app = express();
app.set('view enigne', 'ejs') 
app.set('views', './views')

app.get('/', function (req, res) {
  res.render('index.ejs')
})


// listen on port 3000
app.listen(3000, function () {
    console.log('Express app listening on port 3000');
  });