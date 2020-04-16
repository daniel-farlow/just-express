const express = require('express');
let router = express.Router();

function validateUser(req, res, next) {
  res.locals.validated = true;
  next();
}

router.use(validateUser);

router.get('/', (req, res, next) => {
  res.json({
    msg: 'Router works!'
  })
})

router.post('/', (req, res, next) => {
  res.json({
    msg: 'Router works!'
  })
})

module.exports = router