// Native node modules
const path = require('path');
require('dotenv').config();

// Third-part modules
const express = require('express');
const app = express();
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');

//=============== PASSPORT FILES ===============//
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
//==============================================//

// Import custom routers
const indexRouter = require('./routes/indexRouter');

// Application settings
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Application-level middleware
app.use(helmet());

//=============== PASSPORT CONFIG ===============//
app.use(session({
  secret: 'I love Express!',
  resave: false,
  saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());
const passportConfig = require('./config');
passport.use(new GitHubStrategy(passportConfig,
  function (accessToken, refreshToken, profile, cb) {
    // console.log(profile)
    return cb(null, profile)
  }
));
passport.serializeUser((user, cb) => {
  cb(null,user);
})
passport.deserializeUser((user, cb) => {
  cb(null,user);
})
//==============================================//

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Use router middleware on specified paths
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
