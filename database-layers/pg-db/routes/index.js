const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/', (req, res, next) => {
  db.query(`SELECT * FROM city_weathers WHERE id > $1`, [30], (error, dbResponse) => {
    console.log(dbResponse.rows);
    res.json(dbResponse.rows)
  })

  // db.end() // this will release the connection back into the pool
})

module.exports = router;