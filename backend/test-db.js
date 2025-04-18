const { Pool } = require('pg');

const pool = new Pool({
  host: 'jobplex1.cixko6g8cczy.us-east-1.rds.amazonaws.com',
  port: 5432,
  user: 'postgres',
  password: 'philgabby2003',
  database: 'jobplex',
  ssl: false
});

console.log('Attempting to connect to database...');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Connection error:', err);
  } else {
    console.log('Connection successful!');
    console.log('Server time:', res.rows[0]);
  }
  pool.end();
});