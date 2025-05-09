const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// Ensure the bookings table exists with the updated structure
async function bookingsTableExists() {
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
                CONSTRAINT bookings_pkey PRIMARY KEY (id),
                CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles (id) ON DELETE CASCADE,
                CONSTRAINT bookings_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.schedules (id) ON DELETE SET NULL
            );
            
            CREATE UNIQUE INDEX IF NOT EXISTS bookings_pkey ON bookings USING BTREE (id);
        `);
        console.log("Bookings table checked/created successfully with updated structure.");
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

// Implementing Room Booking Persistence and Profile Redirection

// Add a new endpoint to get user's guesthouse bookings
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    
    try {
        // Join gbookings with rooms and properties to get complete booking information
        const result = await pool.query(
            `SELECT gb.*, 
                    r.name as room_name, r.price, r.capacity, r.images,
                    p.name as property_name, p.address
             FROM gbookings gb
             JOIN rooms r ON gb.room_id = r.id
             JOIN properties p ON gb.property_id = p.id
             WHERE gb.traveller_id = $1
             ORDER BY gb.id DESC`,
            [userId]
        );
        
        res.json({ success: true, bookings: result.rows });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
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

// GET user's guesthouse bookings
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Join with properties and rooms to get complete booking information
    const result = await pool.query(`
      SELECT 
        b.id, 
        b.traveller_id, 
        b.property_id, 
        b.room_id, 
        b.check_in, 
        b.check_out, 
        b.status,
        p.name as property_name,
        p.address as property_address,
        r.name as room_name,
        r.price
      FROM gbookings b
      JOIN properties p ON b.property_id = p.id
      JOIN rooms r ON b.room_id = r.id
      WHERE b.traveller_id = $1
      ORDER BY b.check_in DESC
    `, [userId]);

    res.json({ success: true, bookings: result.rows });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
});

module.exports = {
    router,
    bookingsTableExists,
};