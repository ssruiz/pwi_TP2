const { Client } = require('pg');

const connectionString = 'postgresql://postgres:system@localhost:5432/tp2';

  const client = new Client({
    connectionString: connectionString,
  });

 client.connect().then(()=>{
   console.log("Connected to DB!");

 }).catch(err => console.log(err.code));

 module.exports = client;