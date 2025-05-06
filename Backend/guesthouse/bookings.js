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
        // Validate dates
        const checkInDate = new Date(check_in);
        const checkOutDate = new Date(check_out);
        
        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid date format' });
        }
        
        if (checkInDate >= checkOutDate) {
            return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (checkInDate < today) {
            return res.status(400).json({ success: false, message: 'Check-in date cannot be in the past' });
        }
        
        // First, check if the room is available
        const availabilityCheck = await pool.query(
            'SELECT available FROM rooms WHERE id = $1 AND property_id = $2',
            [room_id, property_id]
        );
        
        // If no room found or room is not available
        if (availabilityCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }
        
        if (!availabilityCheck.rows[0].available) {
            return res.status(400).json({ success: false, message: 'Room is not available for booking' });
        }
        
        // Check for overlapping bookings
        const overlapCheck = await pool.query(
            `SELECT * FROM bookings 
             WHERE room_id = $1 
             AND status != 'cancelled'
             AND (
                 (check_in <= $2 AND check_out >= $2) OR
                 (check_in <= $3 AND check_out >= $3) OR
                 (check_in >= $2 AND check_out <= $3)
             )`,
            [room_id, check_in, check_out]
        );
        
        if (overlapCheck.rows.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Room is already booked for the selected dates' 
            });
        }
        
        // Begin transaction
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Create the booking
            const bookingResult = await client.query(
                `INSERT INTO bookings (traveller_id, property_id, room_id, check_in, check_out)
                VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [traveller_id, property_id, room_id, check_in, check_out]
            );
            
            // Update room availability to false
            await client.query(
                'UPDATE rooms SET available = false WHERE id = $1 AND property_id = $2',
                [room_id, property_id]
            );
            
            await client.query('COMMIT');
            
            res.status(201).json({ success: true, booking: bookingResult.rows[0] });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
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

// Add a new endpoint to cancel booking and make room available again
router.post('/:id/cancel', async (req, res) => {
    const bookingId = req.params.id;
    
    try {
        // Begin transaction
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Get booking details
            const bookingResult = await client.query(
                'SELECT room_id, property_id FROM bookings WHERE id = $1',
                [bookingId]
            );
            
            if (bookingResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }
            
            const { room_id, property_id } = bookingResult.rows[0];
            
            // Update booking status
            await client.query(
                'UPDATE bookings SET status = $1 WHERE id = $2',
                ['cancelled', bookingId]
            );
            
            // Make room available again
            await client.query(
                'UPDATE rooms SET available = true WHERE id = $1 AND property_id = $2',
                [room_id, property_id]
            );
            
            await client.query('COMMIT');
            
            res.status(200).json({ success: true, message: 'Booking cancelled and room is available again' });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ success: false, message: 'Failed to cancel booking' });
    }
});

module.exports = {
    router,
    bookingsTableExists,
};