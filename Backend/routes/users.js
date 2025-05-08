const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function usersTableExists() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id VARCHAR(255) PRIMARY KEY,
        user_email VARCHAR(255) UNIQUE
      );
    `);
    console.log("Users table checked/created successfully.");
  } catch (error) {
    console.error("Error checking or creating users table:", error);
  }
}

router.post('/', async (req, res) => {
  const { user_id, user_email } = req.body;

  console.log('Incoming request:', req.body);

  if (!user_id || !user_email) {
    return res.status(400).json({ error: 'Missing user_id or user_email' });
  }

  try {
    await pool.query(
      'INSERT INTO users (user_id, user_email) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING',
      [user_id, user_email]
    );
    res.status(201).json({ message: 'User added or already exists.' });
  } catch (error) {
    console.error('Error inserting user:', error);
    res.status(500).json({ error: 'Database error.' });
  }
});

module.exports = {
  router,
  usersTableExists,
};
