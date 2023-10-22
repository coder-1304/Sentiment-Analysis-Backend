const {createPool} = require('mysql2');
require('dotenv').config();


const pool = createPool({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'SentimentAnalysis',
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Database connected!');
    connection.release();
  }
});

module.exports = pool;
