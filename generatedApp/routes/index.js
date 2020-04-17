var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const date = new Date(1969, 6);
  console.log(req.accepts('application/json'))
  res.set('Date', date);
  res.set('Content-Type', 'text/html');
  res.set('Cache-Control', 'no-store');
  res.render('index', { title: 'Express' });
});

module.exports = router;
