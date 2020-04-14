const path = require('path');

const express = require('express');
const app = express();
const helmet = require('helmet');

app.use(helmet());

app.set('views', path.join(__dirname + '/practice-views'));

app.set('view engine', 'ejs'); 

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

function randomNumInclusive(min,max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function validateUser(req, res, next) {
  res.locals.validated = (randomNumInclusive(0,1) === 1 ? true : false);
  next();
}

function userType(req, res, next) {
  let {validated} = res.locals;
  res.locals.userType = (validated ? 'premium' : 'basic');
  next();
}

function greetingMsg(req, res, next) {
  let {userType} = res.locals;
  res.locals.greetingMsg = (userType === 'premium' ? 
    'Thanks for using premium! Drop us a line if you see room for improvement.'
    : 'Enjoying your basic plan? Consider upgrading to premium!')
  res.locals.bannerMsg = 'bannerMsg set on res.locals during middleware sequence'
  next();
}

app.get('/', validateUser);
app.get('/', userType);
app.get('/', greetingMsg);

app.get('/', (req, res, next) => {
  res.render('index', {
    bannerMsg: 'bannerMsg passed manually in second argument in res.render'
  });
});

app.listen(3000);