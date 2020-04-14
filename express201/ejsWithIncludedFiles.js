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

app.get('/about', (req, res, next) => {
  res.render('about', {
    msg: 'an about message'
  })
})

app.get('/', (req, res, next) => {
  res.render('index-with-head-and-navbar', {
    msg: 'a home message'
  });
});

app.listen(3000);
