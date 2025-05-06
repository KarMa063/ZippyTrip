const db = require('../db');

// Create attractions table if it doesn't exist
const createAttractionsTable = async () => {
  try {
    await db.query(`
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

module.exports = {
  // Get all attractions
  getAllAttractions: async () => {
    try {
      const result = await db.query('SELECT * FROM attractions ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      console.error('Error getting attractions:', error);
      return [];
    }
  },
  
  // Get attraction by ID
  getAttractionById: async (id) => {
    try {
      const result = await db.query('SELECT * FROM attractions WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting attraction by ID:', error);
      return null;
    }
  },
  
  // Create new attraction
  createAttraction: async (attraction) => {
    try {
      const { name, location, description, image, rating, properties, featured } = attraction;
      const result = await db.query(
        'INSERT INTO attractions (name, location, description, image, rating, properties, featured) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [name, location, description, image, rating, properties, featured]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating attraction:', error);
      throw error;
    }
  },
  
  // Update attraction
  updateAttraction: async (id, attraction) => {
    try {
      const { name, location, description, image, rating, properties, featured } = attraction;
      const result = await db.query(
        'UPDATE attractions SET name = $1, location = $2, description = $3, image = $4, rating = $5, properties = $6, featured = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
        [name, location, description, image, rating, properties, featured, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating attraction:', error);
      return null;
    }
  },
  
  // Delete attraction
  deleteAttraction: async (id) => {
    try {
      await db.query('DELETE FROM attractions WHERE id = $1', [id]);
      return true;
    } catch (error) {
      console.error('Error deleting attraction:', error);
      return false;
    }
  }
};