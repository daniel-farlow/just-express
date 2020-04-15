// Require native node modules
const path = require('path');

// Require third-party modules
const express = require('express');
const app = express(); // invoke an instance of an Express application
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

// Middleware used at the application level (i.e., on all routes/requests)
app.use(helmet());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

// Set default view engine and where views should be looked for by Express
app.set('view engine', 'ejs');
app.set('views', [
  path.join(__dirname + '/views')
]);

// Routes
app.get('/', (req, res, next) => {
  res.json({
    message: 'Sanity check good'
  });
})

app.get('/login', (req, res, next) => {
  res.render('login');
})

app.post('/process_login', (req, res, next) => {
  const { username, password } = req.body;
  if (password === 'x') {
    res.cookie('username', username);
    res.redirect(303, '/welcome');
  } else {
    res.redirect(303, '/login?msg=fail');
  }
})

app.get('/welcome', (req, res, next) => {
  res.render('welcome', req.cookies);
})

app.get('/logout', (req, res, next) => {
  // clear all cookies:
  // for (let property in req.cookies) {
  //   res.clearCookie(property)
  // }
  res.clearCookie('username')
  res.redirect(303, '/login');
})

app.listen(3000);