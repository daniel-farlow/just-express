const express = require('express');
const router = express.Router();
const axios = require('axios');
const passport = require('passport');

const apiKey = process.env.MOVIE_FAN_API_KEY; // for actual movie database
const apiBaseUrl = 'http://api.themoviedb.org/3'; // for actual movie database
const nowPlayingUrl = `${apiBaseUrl}/movie/now_playing?api_key=${apiKey}`; // for actual movie database

const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';

router.use((req, res, next) => {
  res.locals.imageBaseUrl = imageBaseUrl;
  next();
})

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log('User info please!')
  console.log(req.user)
  axios.get(nowPlayingUrl)
    .then(({ data: { results } }) => results)
    .then(parsedData => res.render('index', {
      parsedData
    }))
});

router.get('/favorites', (req, res, next) => {
  res.json(req.user.displayName)
})

router.get('/login', passport.authenticate('github'));

router.get('/auth/github', passport.authenticate('github', {
  successRedirect: '/',
  failureRedirect: '/loginFailed'
}))

router.get('/movie/:id', (req, res, next) => {
  const { id: movieId } = req.params;
  const movieURL = `${apiBaseUrl}/movie/${movieId}?api_key=${apiKey}`;
  axios.get(movieURL)
    .then(({ data: movieData }) => res.render('single-movie', { movieData, imageBaseUrl }));
})

router.post('/search', (req, res, next) => {
  let { movieSearch: userSearchTerm, cat } = req.body;
  userSearchTerm = encodeURI(userSearchTerm);
  const movieUrl = `${apiBaseUrl}/search/${cat}?query=${userSearchTerm}&api_key=${apiKey}`;
  console.log("The body: ", req.body)
  axios.get(movieUrl)
    .then(({ data }) => {
      console.log(data)
      if (cat === 'person') data.results = data.results[0].known_for;
      res.render('index', { parsedData: data.results })
    })
})


module.exports = router;