const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Create a connection pool to the Neon database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Get all attractions
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM attractions ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching attractions:', error);
    res.status(500).json({ error: 'Failed to fetch attractions' });
  }
});

// Get attraction by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM attractions WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attraction not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching attraction ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch attraction' });
  }
});

module.exports = router;