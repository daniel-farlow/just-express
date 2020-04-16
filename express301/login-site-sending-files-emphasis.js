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

// Custom middleware run at the application level
app.use((req, res, next) => {
  if(req.query.msg === 'fail') {
    res.locals.msg = 'Sorry. This username and password combination does not exist.';
  } else {
    res.locals.msg = '';
  }
  next();
})

// Routes
app.get('/', (req, res, next) => {
  res.json({
    message: 'Sanity check good'
  });
})

app.get('/login', (req, res, next) => {
  console.log(req.query)
  res.render('login');
})

app.post('/process_login', (req, res, next) => {
  const { username, password } = req.body;
  if (password === 'x') {
    res.cookie('username', username);
    res.redirect(303, '/welcome');
  } else {
    res.redirect(303, '/login?msg=fail&test=hello');
    // An unnecessarily compliated query string:
    // res.redirect(303, `/login/?typical=example&some+space=not+so+common&myFriends=Oscar&myFriends=Andy&myFriends=Angela&myShoe[color]=brown&myShoe[type]=dress&myShoe[brand]=Gucci&myNested[firstNest]=littleNest&myNested[secondNest][unnecessary]=true&myNested[secondNest][useful]=probably+not`);
  }
})

app.get('/welcome', (req, res, next) => {
  res.render('welcome', req.cookies);
})

app.param('generalStoryId', (req, res, next, generalStoryId) => {
  console.log('Param called: ', generalStoryId);
  /* The conditional logic:
    - We can modify the request/response objects how we please before they get to our desired route
    - We can then make use of our logic here in our desired route 
    - For example, you may want to set any number of local variables or whatever
  */
  switch(true){
    case(generalStoryId > 0 && generalStoryId < 366):
      res.locals.storyType = 'daily';
      break
    case(generalStoryId < 1000000):
      res.locals.storyType = 'news';
      break
    case(generalStoryId < 1000000000):
      res.locals.storyType = 'blog';
      break
    default:
      res.locals.storyType = '';
      break
  }
  next();
})

app.get('/story/:generalStoryId', (req, res, next) => {
  const { generalStoryId } = req.params;
  const { storyType } = res.locals;
  // simulate dynamic link generation (would likely be a pull from a database)
  res.locals.restOfStoryLink = Math.random(); // <-- maybe something from DB
  res.locals.generalStoryId = generalStoryId;
  switch(storyType){
    case('daily'):
      res.render('daily');
      break;
    case('news'):
      res.render('news');
      break;
    case('blog'):
      res.render('blog');
      break;
    default:
      res.send(`<h1>Woops! Looks like this story does not exist.</h1>`)
      break;
  }
})

app.get('/story/:generalStoryId/:link', (req, res, next) => {
  console.log('The params: ', req.params)
  const {generalStoryId, link} = req.params;
  // the below would likely be res.render based on the link pulled from the DB somehow
  res.send(`<h1>This is the link: ${link}. You are now reading more about story ${generalStoryId}.</h1>`)
})

app.get('/statement', (req, res, next) => {
  // This will render the statement IN the browser which we do not want
  // res.sendFile(path.join(__dirname, 'userStatements/BankStatementAndChecking.png'))
  const {username} = req.cookies;
  res.download(path.join(__dirname, 'userStatements/BankStatementAndChecking.png'), `${username}sStatement.png`)
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