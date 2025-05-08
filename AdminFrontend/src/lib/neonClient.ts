import { Pool } from 'pg';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon's SSL connection
  },
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to Neon database:', err);
  } else {
    console.log('Connected to Neon database at:', res.rows[0].now);
  }
});

// Attraction-related database functions
export const attractionsDb = {
  // Get all attractions
  getAllAttractions: async () => {
    try {
      const result = await pool.query('SELECT * FROM attractions');
      return { success: true, attractions: result.rows };
    } catch (error) {
      console.error('Error fetching attractions:', error);
      return { success: false, message: 'Failed to fetch attractions' };
    }
  },

  // Get attraction by ID
  getAttractionById: async (id: number) => {
    try {
      const result = await pool.query('SELECT * FROM attractions WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return { success: false, message: 'Attraction not found' };
      }
      return { success: true, attraction: result.rows[0] };
    } catch (error) {
      console.error('Error fetching attraction:', error);
      return { success: false, message: 'Failed to fetch attraction' };
    }
  },

  // Add new attraction
  addAttraction: async (attraction: any) => {
    const { name, location, category, price, rating, image, status } = attraction;
    try {
      const result = await pool.query(
        `INSERT INTO attractions 
        (name, location, category, price, rating, image, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [name, location, category, price, rating, image, status]
      );
      return { success: true, attraction: result.rows[0] };
    } catch (error) {
      console.error('Error adding attraction:', error);
      return { success: false, message: 'Failed to add attraction' };
    }
  },

  // Update attraction
  updateAttraction: async (id: number, attraction: any) => {
    const { name, location, category, price, rating, image, status } = attraction;
    try {
      const result = await pool.query(
        `UPDATE attractions SET 
          name = $1,
          location = $2,
          category = $3,
          price = $4,
          rating = $5,
          image = $6,
          status = $7
        WHERE id = $8
        RETURNING *`,
        [name, location, category, price, rating, image, status, id]
      );
      if (result.rows.length === 0) {
        return { success: false, message: 'Attraction not found' };
      }
      return { success: true, attraction: result.rows[0] };
    } catch (error) {
      console.error('Error updating attraction:', error);
      return { success: false, message: 'Failed to update attraction' };
    }
  },

  // Delete attraction
  deleteAttraction: async (id: number) => {
    try {
      const result = await pool.query('DELETE FROM attractions WHERE id = $1 RETURNING *', [id]);
      if (result.rowCount === 0) {
        return { success: false, message: 'Attraction not found' };
      }
      return { success: true, message: 'Attraction deleted successfully' };
    } catch (error) {
      console.error('Error deleting attraction:', error);
      return { success: false, message: 'Failed to delete attraction' };
    }
  },

  // Ensure attractions table exists
  ensureTableExists: async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS attractions(
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          location TEXT,
          category TEXT,
          price NUMERIC,
          rating NUMERIC,
          image TEXT,
          status TEXT
        );
      `);
      console.log('Attractions table checked/created successfully');
      return { success: true };
    } catch (error) {
      console.error('Error creating attractions table:', error);
      return { success: false, message: 'Failed to create attractions table' };
    }
  }
};

export default pool;