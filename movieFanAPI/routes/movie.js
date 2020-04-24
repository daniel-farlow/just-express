const express = require('express');
const router = express.Router();

const movieDetails = require('../data/movieDetails');

function requireJSON(req, res, next) {
  if (!req.is('application/json')) {
    return res.json({ msg: `Content-Type must be application/json` })
  }
  else {
    return next();
  }
}

router.param('movieId', (req, res, next, movieId) => {
  // if only certain API keys are allowed to hit movieId
  // update the db with analytics data
  console.log('Someone hit a route that used the movieId wildcard')
  console.log(movieId)
  return next();
})

// GET /movie/top_rated
router.get('/top_rated', (req, res, next) => {
  let { page } = req.params;
  console.log(page)
  if (!page) { page = 1 };
  results = [...movieDetails].sort((movieOne, movieTwo) => movieOne.vote_average - movieTwo.vote_average);
  return res.json(results.slice((page - 1) * 20, page * 20));
})

// GET /movie/movieId
router.get('/:movieId', (req, res, next) => {
  let { movieId } = req.params;
  let results = movieDetails.find(movie => movie.id === +movieId);
  if (!results) {
    return res.json({ msg: 'Movie not found' })
  }
  else {
    return res.json({
      movie_id: movieId,
      results
    })
  }
})

// POST /movie/{movie_id}/rating
router.post('/:movieId/rating', requireJSON, (req, res, next) => {
  console.log('HIIIIIII')
  let { movieId } = req.params;
  console.log(req.body)
  let { value: userRating } = req.body;
  if ((userRating < 0.5) || (userRating > 10)) {
    return res.json({ msg: 'Rating must be between .5 and 10' })
  } else {
    return res.json({
      status_code: 200,
      msg: 'Thank you for submitting your rating'
    })
  }
})

// DELETE /movie/{movie_id}/rating
router.delete('/:movieId/rating', requireJSON, (req, res, next) => {
  res.json({ msg: 'Rating deleted' })
})



module.exports = router;
