const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - ensure CORS allows all frontend origins
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080', 'http://localhost:8082', 'http://localhost:8083'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Database connection - FIXED
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://ZippyTrip_owner:npg_iX4GFVa3QKZt@ep-fragrant-bar-a1v8zqru-pooler.ap-southeast-1.aws.neon.tech/ZippyTrip?sslmode=require",
  ssl: {
    rejectUnauthorized: false
  }
});

// Create attractions table if it doesn't exist
const createAttractionsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attractions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        rating DECIMAL(3,1) DEFAULT 4.0,
        properties INTEGER DEFAULT 0,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('Attractions table created or already exists');
  } catch (error) {
    console.error('Error creating attractions table:', error);
  }
};

// Initialize the table
createAttractionsTable();

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Attractions routes
app.get('/api/attractions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM attractions ORDER BY created_at DESC');
    res.json({ success: true, attractions: result.rows });
  } catch (error) {
    console.error('Error fetching attractions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attractions' });
  }
});

app.post('/api/attractions', async (req, res) => {
  try {
    const { name, location, description, image, rating, properties, featured } = req.body;
    
    // Validation
    if (!name || !location) {
      return res.status(400).json({ 
        success: false, 
        message: "Name and location are required fields" 
      });
    }
    
    console.log('Received attraction data:', req.body);
    
    const result = await pool.query(
      `INSERT INTO attractions 
      (name, location, description, image, rating, properties, featured)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [name, location, description, image, 
       parseFloat(rating) || 0, 
       parseInt(properties) || 0, 
       featured || false]
    );
    
    res.status(201).json({ success: true, attraction: result.rows[0] });
  } catch (error) {
    console.error("Error adding attraction:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get('/api/attractions/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM attractions WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Attraction not found' });
    }
    res.json({ success: true, attraction: result.rows[0] });
  } catch (error) {
    console.error('Error fetching attraction:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attraction' });
  }
});

app.put('/api/attractions/:id', async (req, res) => {
  try {
    const { name, location, description, image, rating, properties, featured } = req.body;
    const result = await pool.query(
      `UPDATE attractions 
      SET name = $1, location = $2, description = $3, image = $4, 
          rating = $5, properties = $6, featured = $7, updated_at = NOW() 
      WHERE id = $8 
      RETURNING *`,
      [name, location, description, image, parseFloat(rating), parseInt(properties), featured, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Attraction not found' });
    }
    
    res.json({ success: true, attraction: result.rows[0] });
  } catch (error) {
    console.error('Error updating attraction:', error);
    res.status(500).json({ success: false, message: 'Failed to update attraction' });
  }
});

app.delete('/api/attractions/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM attractions WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Attraction not found' });
    }
    
    res.json({ success: true, message: 'Attraction deleted successfully' });
  } catch (error) {
    console.error('Error deleting attraction:', error);
    res.status(500).json({ success: false, message: 'Failed to delete attraction' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});