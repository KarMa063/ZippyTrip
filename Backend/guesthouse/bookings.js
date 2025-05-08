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
            CREATE TABLE IF NOT EXISTS gbookings(
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

// Add a new endpoint to check room availability for specific dates
router.get('/check-availability', async (req, res) => {
    const { property_id, check_in, check_out } = req.query;
    
    if (!property_id || !check_in || !check_out) {
        return res.status(400).json({ 
            success: false, 
            message: 'Missing required parameters: property_id, check_in, and check_out are required' 
        });
    }
    
    try {
        // Get all rooms for the property
        const roomsResult = await pool.query(
            'SELECT id FROM rooms WHERE property_id = $1',
            [property_id]
        );
        
        if (roomsResult.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No rooms found for this property' 
            });
        }
        
        // Get all room IDs
        const roomIds = roomsResult.rows.map(room => room.id);
        
        // Check for bookings that overlap with the requested dates
        const bookingsResult = await pool.query(
            `SELECT room_id FROM gbookings 
             WHERE property_id = $1 
             AND room_id = ANY($2)
             AND status != 'cancelled'
             AND (
                 (check_in <= $3 AND check_out > $3) OR
                 (check_in < $4 AND check_out >= $4) OR
                 (check_in >= $3 AND check_out <= $4)
             )`,
            [property_id, roomIds, check_in, check_out]
        );
        
        // Create a set of unavailable room IDs
        const unavailableRoomIds = new Set(bookingsResult.rows.map(booking => booking.room_id));
        
        res.json({ 
            success: true, 
            unavailableRoomIds: Array.from(unavailableRoomIds)
        });
    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to check availability' 
        });
    }
});

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
        
        // Check for overlapping bookings
        const overlapCheck = await pool.query(
            `SELECT * FROM gbookings 
             WHERE room_id = $1 
             AND status != 'cancelled'
             AND (
                 (check_in <= $2 AND check_out > $2) OR
                 (check_in < $3 AND check_out >= $3) OR
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
                `INSERT INTO gbookings (traveller_id, property_id, room_id, check_in, check_out)
                VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [traveller_id, property_id, room_id, check_in, check_out]
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
        const result = await pool.query('SELECT * FROM gbookings ORDER BY id DESC');
        res.json({ success: true, bookings: result.rows });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }
});

router.get('/:id', async (req, res) => {
    const bookingId = req.params.id;
    try {
        const result = await pool.query('SELECT * FROM gbookings WHERE id = $1', [bookingId]);

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
                'SELECT room_id, property_id FROM gbookings WHERE id = $1',
                [bookingId]
            );
            
            if (bookingResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }
            
            const { room_id, property_id } = bookingResult.rows[0];
            
            // Update booking status
            await client.query(
                'UPDATE gbookings SET status = $1 WHERE id = $2',
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
    bookingsTableExists
};