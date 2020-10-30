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
  path.join(__dirname, 'views')
]);

// Routes
app.get('/', (req, res, next) => {
  console.log(req.cookies)
  res.json({
    message: 'Sanity check good'
  });
})

app.get('/login', (req, res, next) => {
  console.log('Cookies available at /login:', req.cookies);
  res.render('login', {msg: ''});
})

app.post('/process_login', (req, res, next) => {
  // console.log(req.body);
  const { username, password } = req.body;
  // check db to see if user credentials are valid
  if (password === 'x') {
    // if the username and password combo is correct, then we want to send the user to the welcome page but first we want to save the username in a cookie (so it'll be readily available)
    res.cookie('username', username);
    // res.redirect(307, '/welcome');
    res.redirect(303, '/welcome');
  } else {
    res.redirect(303, '/login?msg=fail');
  }
})

app.post('/welcome', (req, res, next) => {
  res.json({
    msg: 'wow it worked!'
  })
})

app.get('/welcome', (req, res, next) => {
  res.render('welcome', {
    username: req.cookies.username
  });
})

app.get('/logout', (req, res, next) => {
  // clear all cookies:
  // for (let property in req.cookies) {
  //   res.clearCookie(property)
  // }
  console.log('Cookies before clearing:', req.cookies);
  res.clearCookie('username');
  console.log('Cookies after clearing:', req.cookies);
  res.redirect(303, '/login');
  console.log('Cookies after clearing and after redirect:', req.cookies);
})

app.listen(3000);