const db = require('../config/db');

// Get all attractions
const getAllAttractions = async () => {
  try {
    const result = await db.query(
      'SELECT * FROM attractions ORDER BY id'
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching attractions:', error);
    throw error;
  }
};

// Get attraction by ID
const getAttractionById = async (id) => {
  try {
    const result = await db.query(
      'SELECT * FROM attractions WHERE id = $1',
      [id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching attraction by ID:', error);
    throw error;
  }
};

// Create new attraction
const createAttraction = async (attractionData) => {
  const { name, location, category, price, rating, image, status } = attractionData;
  
  try {
    const result = await db.query(
      'INSERT INTO attractions (name, location, category, price, rating, image, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, location, category, price, rating, image, status]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating attraction:', error);
    throw error;
  }
};

// Update attraction
const updateAttraction = async (id, attractionData) => {
  const { name, location, category, price, rating, image, status } = attractionData;
  
  try {
    const result = await db.query(
      'UPDATE attractions SET name = $1, location = $2, category = $3, price = $4, rating = $5, image = $6, status = $7 WHERE id = $8 RETURNING *',
      [name, location, category, price, rating, image, status, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating attraction:', error);
    throw error;
  }
};

// Delete attraction
const deleteAttraction = async (id) => {
  try {
    await db.query('DELETE FROM attractions WHERE id = $1', [id]);
    return { success: true };
  } catch (error) {
    console.error('Error deleting attraction:', error);
    throw error;
  }
};

module.exports = {
  getAllAttractions,
  getAttractionById,
  createAttraction,
  updateAttraction,
  deleteAttraction
};