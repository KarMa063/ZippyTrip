const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool using the connection string from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for some Neon database connections
  }
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error acquiring client:', err.stack);
  } else {
    console.log('✅ Connected to Neon PostgreSQL database');
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
