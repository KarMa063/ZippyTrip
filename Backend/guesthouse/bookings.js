const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// Ensure the bookings table exists
async function bookingsTableExists() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS bookings(
                id SERIAL PRIMARY KEY,
                traveller_id INTEGER NOT NULL,
                property_id INTEGER NOT NULL,
                room_id INTEGER NOT NULL,
                check_in DATE NOT NULL,
                check_out DATE NOT NULL,
                status TEXT DEFAULT 'pending'
            );
        `);
        console.log("Bookings table checked/created successfully.");
    } catch (error) {
        console.error("Error checking or creating the bookings table:", error);
    }
}

router.post('/', async (req, res) => {
    const { traveller_id, property_id, room_id, check_in, check_out } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO bookings (traveller_id, property_id, room_id, check_in, check_out)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [traveller_id, property_id, room_id, check_in, check_out]
        );

        res.status(201).json({ success: true, booking: result.rows[0] });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ success: false, message: 'Failed to create booking' });
    }
});

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM bookings ORDER BY id DESC');
        res.json({ success: true, bookings: result.rows });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }
});

router.get('/:id', async (req, res) => {
    const bookingId = req.params.id;
    try {
        const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.json({ success: true, booking: result.rows[0] });
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch booking' });
    }
});

module.exports = {
    router,
    bookingsTableExists,
};
