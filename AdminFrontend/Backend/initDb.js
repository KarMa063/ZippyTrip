const fs = require('fs');
const path = require('path');
const { pool } = require('./config/db');

async function initializeDatabase() {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'database.sql');
    const sqlCommands = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Initializing database...');
    
    // Execute the SQL commands
    await pool.query(sqlCommands);
    
    console.log('Database initialized successfully!');
    
    // Close the pool
    await pool.end();
    
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run the initialization
initializeDatabase();