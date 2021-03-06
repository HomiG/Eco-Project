var express = require('express');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var path = require('path');
var router = require('./routes/home')


// import my module "home"
const home = require('./routes/home')
var app = express();
app.set('view enigne', 'ejs') 
app.set('views', './views')
app.use('/public', express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname + '/routes'));
app.use('/login', home)

app.use('/', home)  // whenever browse into /, use the home module

// listen on port 3000
app.listen(3000, function () {
    console.log('Express app listening on port 3000');
  });



