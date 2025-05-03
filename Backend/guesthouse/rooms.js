const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Create Rooms Table if it doesn't exist
async function createRoomsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        price TEXT NOT NULL,
        available BOOLEAN DEFAULT true,
        amenities TEXT[],
        images JSONB
      );
    `);
    console.log("Rooms table created or already exists.");
  } catch (error) {
    console.error("Error creating rooms table:", error);
  }
}

// POST route to create a room
router.post('/:propertyId/rooms', async (req, res) => {
  const { propertyId } = req.params;
  const { name, capacity, price, available = true, amenities = [], images = [] } = req.body;

  try {
    // Check if the propertyId exists in the properties table
    const propertyCheck = await pool.query(
      'SELECT id FROM properties WHERE id = $1',
      [propertyId]
    );

    if (propertyCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // If property exists, proceed with room insertion
    const result = await pool.query(
      `INSERT INTO rooms 
        (property_id, name, capacity, price, available, amenities, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        propertyId,
        name,
        capacity,
        price,
        available,
        amenities,
        JSON.stringify(images),
      ]
    );

    res.status(201).json({ success: true, room: result.rows[0] });
  } catch (error) {
    console.error("Error adding room:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET route to retrieve all rooms for a specific property
router.get('/:propertyId/rooms', async (req, res) => {
  const { propertyId } = req.params;

  try {
    const propertyCheck = await pool.query(
      'SELECT id FROM properties WHERE id = $1',
      [propertyId]
    );

    if (propertyCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    const rooms = await pool.query(
      'SELECT * FROM rooms WHERE property_id = $1',
      [propertyId]
    );

    res.status(200).json({ success: true, rooms: rooms.rows });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET route to retrieve a specific room by its ID within a property
router.get('/:propertyId/rooms/:roomId', async (req, res) => {
  const { propertyId, roomId } = req.params;

  try {
    const propertyCheck = await pool.query(
      'SELECT id FROM properties WHERE id = $1',
      [propertyId]
    );

    if (propertyCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    const room = await pool.query(
      'SELECT * FROM rooms WHERE property_id = $1 AND id = $2',
      [propertyId, roomId]
    );

    if (room.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    res.status(200).json({ success: true, room: room.rows[0] });
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PUT route to edit a room
router.put('/:propertyId/rooms/:roomId', async (req, res) => {
  const { propertyId, roomId } = req.params;
  const { name, capacity, price, available, amenities = [], images = [] } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE rooms
       SET name = $1, capacity = $2, price = $3, available = $4, amenities = $5, images = $6
       WHERE property_id = $7 AND id = $8
       RETURNING *`,
      [
        name,
        capacity,
        price,
        available,
        amenities,
        JSON.stringify(images),
        propertyId,
        roomId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    res.status(200).json({ success: true, room: result.rows[0] });
  } catch (error) {
    console.error("Error editing room:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// DELETE route to remove a specific room
router.delete('/:propertyId/rooms/:roomId', async (req, res) => {
  const { propertyId, roomId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM rooms WHERE property_id = $1 AND id = $2 RETURNING *',
      [propertyId, roomId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    res.status(200).json({ success: true, message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Export the router and table creation function
module.exports = {
  router,
  createRoomsTable,
};
