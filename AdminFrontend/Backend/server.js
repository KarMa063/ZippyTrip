const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connection
const db = require('./config/db');

// Import routes
const attractionsRoutes = require('./routes/attractions');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/attractions', attractionsRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Database test route
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ 
      message: 'Database connection successful!',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      details: error.message
    });
  }
});

// Define port
const PORT = process.env.PORT || 5000;

// Start server
// After defining your app but before starting the server
// Add this code:

// Test database connection on startup
db.query('SELECT NOW()')
  .then(result => {
    console.log('✅ Database connection successful!');
    console.log(`Database timestamp: ${result.rows[0].now}`);
  })
  .catch(error => {
    console.error('❌ Database connection failed:', error.message);
  });

// Then continue with your existing code
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});