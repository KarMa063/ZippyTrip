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

// POST /api/users → add new user
router.post('/', async (req, res) => {
  const { user_id, user_email } = req.body;

  if (!user_id || !user_email) {
    return res.status(400).json({ error: 'Missing user_id or user_email' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO users (user_id, user_email) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING',
      [user_id, user_email]
    );
    res.status(201).json({ message: 'User added or already exists.' });
  } catch (error) {
    console.error('Error inserting user:', error);
    res.status(500).json({ error: 'Database error.' });
  }
});

// GET /api/users → get all users
router.get('/', async (req, res) => {
  console.log('Incoming GET request for all users.');

  try {
    const result = await pool.query('SELECT * FROM users');
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT email FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ 
      success: true,
      email: result.rows[0].email
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = {
  router,
  usersTableExists,
};
