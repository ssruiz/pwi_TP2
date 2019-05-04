var knex = require('knex')({
  client: 'pg',
  connection: {
    host : 'localhost',
    user : 'samuel',
    password : 'system',
    database : 'tp2'
  },
  pool: { min: 0, max: 1 }
});

module.exports = knex;