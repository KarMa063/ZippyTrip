const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// const { router: guestHouseRoomsRouter, createRoomsTable } = require('./guesthouse/rooms');
const { Pool } = require('pg');

// Load environment variables
dotenv.config();

const app = express();

// Configure PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Properties routes
app.get('/api/gproperties', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM properties');
    res.json({ success: true, properties: result.rows });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch properties' });
  }
});

app.get('/api/gproperties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM properties WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    
    res.json({ success: true, property: result.rows[0] });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch property' });
  }
});

// Mount the rooms router
app.use('/api/gproperties', guestHouseRoomsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// Initialize database tables
async function initializeTables() {
  try {
    // Create properties table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT,
        owner_id TEXT NOT NULL,
        images JSONB,d
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await createRoomsTable();
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeTables();
});