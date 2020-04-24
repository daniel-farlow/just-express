const PoolClass = require('pg').Pool;

// const {Pool} = require('pg');
// const pg = require('pg');
// pgPool = pg.Pool; 
const pool = new PoolClass({
  user: 'postgres',
  host: 'localhost',
  database: 'weatherTiler_development',
  port: 5432,
  password: ''
})

module.exports = {
  query: (queryText, params, callback) => {
    return pool.query(queryText, params, callback);
  }
}