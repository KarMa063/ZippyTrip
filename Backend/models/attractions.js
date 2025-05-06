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
    const result = await db.query('SELECT * FROM attractions ORDER BY created_at DESC');
    return result.rows;
  },
  
  // Get attraction by ID
  getAttractionById: async (id) => {
    const result = await db.query('SELECT * FROM attractions WHERE id = $1', [id]);
    return result.rows[0];
  },
  
  // Create new attraction
  createAttraction: async (attraction) => {
    const { name, location, description, image, rating, properties, featured } = attraction;
    const result = await db.query(
      'INSERT INTO attractions (name, location, description, image, rating, properties, featured) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, location, description, image, rating, properties, featured]
    );
    return result.rows[0];
  },
  
  // Update attraction
  updateAttraction: async (id, attraction) => {
    const { name, location, description, image, rating, properties, featured } = attraction;
    const result = await db.query(
      'UPDATE attractions SET name = $1, location = $2, description = $3, image = $4, rating = $5, properties = $6, featured = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
      [name, location, description, image, rating, properties, featured, id]
    );
    return result.rows[0];
  },
  
  // Delete attraction
  deleteAttraction: async (id) => {
    await db.query('DELETE FROM attractions WHERE id = $1', [id]);
  }
};