var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressSession = require("express-session");
const passport = require('passport');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: "hey hey",
  cookie: { secure: false } // set to true if using https
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Corrected Passport serialization
const User = require('./models/users');
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Catch-all route for debugging
app.use('*', (req, res, next) => {
  console.log(`404 - Not Found: ${req.originalUrl}`);
  next(createError(404, `Not Found: ${req.originalUrl}`));
});

// error handler
app.use(function(err, req, res, next) {
  console.error(`Error: ${err.message}`);
  console.error(`Stack: ${err.stack}`);

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;