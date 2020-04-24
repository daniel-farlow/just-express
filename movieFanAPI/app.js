// load process environment variables
require('dotenv').config();

// modules native to node
const path = require('path');

// third-party modules
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const multer = require('multer');
const upload = multer();

// routers
const indexRouter = require('./routes/index');
const movieRouter = require('./routes/movie');
const searchRouter = require('./routes/search');

// application-level middleware
app.use(helmet());

app.use((req, res, next) => {
  // cut off the API response if the API key is bad
  const { api_key } = req.query;
  if (api_key != '123456789') {
    res.status(401); // unauthorized = 401
    res.json({ unauthorized: `Invalid API Key` })
  } else {
    next();
  }
})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// invoke usage of routers on specified paths
app.use('/', indexRouter);
app.use('/movie', movieRouter);
app.use('/search', searchRouter);

module.exports = app;
