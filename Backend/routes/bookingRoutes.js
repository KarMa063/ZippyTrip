// routes/bookings.js

const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Create Bookings Table if it doesn't exist with the updated structure
async function createBookingsTable() {
  try {
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID,
        schedule_id UUID,
        booking_date TIMESTAMP WITH TIME ZONE,
        seat_numbers TEXT,
        total_fare NUMERIC,
        status TEXT,
        payment_status TEXT,
        payment_method TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        origin TEXT,
        destination TEXT,
        email TEXT,
        CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles (id) ON DELETE CASCADE,
        CONSTRAINT bookings_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES schedules (id) ON DELETE SET NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS bookings_pkey ON bookings USING BTREE(id);
    `);
    console.log("✅ Bookings table created or already exists with updated structure.");
  } catch (error) {
    console.error("❌ Error creating bookings table:", error);
  }
}

// POST /api/bookings - Create new booking
router.post('/', async (req, res) => {
  const { 
    user_id, 
    schedule_id, 
    seat_numbers, 
    total_fare, 
    status, 
    payment_status, 
    payment_method, 
    booking_date,
    origin,
    destination,
    email
  } = req.body;
  
  if (!user_id) {
    return res.status(400).json({ success: false, message: 'user_id is required' });
  }

  try {
    const seatNumbersString = Array.isArray(seat_numbers) ? seat_numbers.join(',') : seat_numbers;

    const result = await pool.query(
      `INSERT INTO bookings 
        (user_id, schedule_id, seat_numbers, total_fare, status, payment_status, payment_method, booking_date, origin, destination, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        user_id, 
        schedule_id, 
        seatNumbersString, 
        total_fare, 
        status, 
        payment_status, 
        payment_method, 
        booking_date,
        origin,
        destination,
        email
      ]
    );
    
    res.status(201).json({ success: true, booking: result.rows[0] });
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// GET /api/bookings - Get all bookings
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
    res.status(200).json({ success: true, bookings: result.rows });
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/bookings/:id - Get booking by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({ success: true, booking: result.rows[0] });
  } catch (error) {
    console.error("❌ Error fetching booking by id:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/bus-bookings/user/:userId - Get bookings by user ID
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query('SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.status(200).json({ success: true, bookings: result.rows });
  } catch (error) {
    console.error("❌ Error fetching user bookings:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = {
  router,
  createBookingsTable
};
