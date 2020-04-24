const express = require('express');
const router = express.Router();

const movies = require('../data/movies');
const people = require('../data/people');

function queryRequired(req, res, next) {
  let {query: searchTerm} = req.query;
  if (!searchTerm) return res.json({msg: 'Query is required'});
  else return next();
}

router.use(queryRequired); // This middleware will be used by ALL routes in THIS router

router.get('/', (req, res, next) => {
  res.json({msg: `search router is ready to go!`})
})

// GET /search/movie
router.get('/movie', (req, res, next) => {
  const {query: searchTerm} = req.query;
  console.log(searchTerm)
  let results = movies.filter(movie => {
    let searchPattern = new RegExp(searchTerm, 'i')
    return searchPattern.test(movie.overview) || searchPattern.test(movie.title)
  })
  res.json({results})
})

// GET /search/person
router.get('/person', (req, res, next) => {
  const {query: searchTerm} = req.query;
  console.log(searchTerm)
  let results = people.filter(person => {
    let searchPattern = new RegExp(searchTerm, 'i')
    return searchPattern.test(person.name);
  })
  res.json({results})
})


module.exports = router;
