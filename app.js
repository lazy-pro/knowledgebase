//mongodb , jquery ,ajax
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const flash = require('connect-flash')
const session = require('express-session')
const config = require('./config/database');
const passport =require('passport')

//connect to db
mongoose.connect(config.database);
let db = mongoose.connection;

//check connection
db.once('open',function(){
    console.log('connected to mongodb');
});

//check for DB errors
db.on('error',function(err){
  console.log('err');
});

//init app
const app = express();

//bring in Models
let Article=require('./models/article');

//load view engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

//Body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//set Public folder
app.use(express.static(path.join(__dirname,'public')));

//session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  //cookie: { secure: true }
}));

//express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//express validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//Pasport config
require('./config/passport')(passport);
//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//route for all the urls
app.get('*',function(req,res,next){
  //setting global user variable to the reuested user if it exists
  res.locals.user = req.user || null;
  //calling for next middleware
  next();
});

//home route
app.get('/', function(req,res){
  Article.find({},function(err,articles){
    if(err){
      console.log(err);
    }
    else{
      res.render('index',{
        title:'All Articles',
        articles: articles
      });
    }
  });
});

//Route files
let articles =require('./routes/articles');
let users =require('./routes/users');
app.use('/articles',articles);
app.use('/users',users);

//start server
app.listen(3500, function(){
  console.log('Server running on 3500...')
});
