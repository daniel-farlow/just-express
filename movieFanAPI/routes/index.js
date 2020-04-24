const express = require('express');
const router = express.Router();

const movies = require('../data/movies');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/most_popular', (req, res, next) => {
  let { page } = req.query;
  if (page === undefined) { page = 1;}
  let results = movies.filter(movie => movie.most_popular === true);
  console.log(results.length)
  results = results.slice((page - 1) * 20, page * 20);
  res.json({
    page,
    results
  })
})

module.exports = router;
