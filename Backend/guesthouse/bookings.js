const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Create bookings table with all required fields
async function bookingsTableExists() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gbookings(
        id SERIAL PRIMARY KEY,
        traveller_id VARCHAR NOT NULL,
        property_id INTEGER NOT NULL,
        room_id INTEGER NOT NULL,
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        status TEXT DEFAULT 'pending',
        checkin_status TEXT DEFAULT 'not_checked_in',
        total_price TEXT NOT NULL
      );
    `);
    console.log("Bookings table checked/created successfully.");
  } catch (error) {
    console.error("Error checking or creating the bookings table:", error);
  }
}

// Helper function to calculate number of nights
function calculateNights(checkIn, checkOut) {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const firstDate = new Date(checkIn);
  const secondDate = new Date(checkOut);
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
}

// Create new booking with total price calculation
router.post('/', async (req, res) => {
  const { traveller_id, property_id, room_id, check_in, check_out } = req.body;

  try {
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
    
    // Get room price
    const roomResult = await pool.query(
      'SELECT price FROM rooms WHERE id = $1 AND property_id = $2',
      [room_id, property_id]
    );
    
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    const roomPrice = parseFloat(roomResult.rows[0].price);
    if (isNaN(roomPrice) || roomPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid room price' });
    }
    
    // Calculate total price
    const nights = calculateNights(check_in, check_out);
    const totalPrice = nights * roomPrice;
    
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
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const bookingResult = await client.query(
        `INSERT INTO gbookings 
          (traveller_id, property_id, room_id, check_in, check_out, total_price)
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [traveller_id, property_id, room_id, check_in, check_out, totalPrice]
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

// Get all bookings with detailed information
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT g.*, r.price as room_price, r.name as room_name
       FROM gbookings g
       JOIN rooms r ON g.room_id = r.id AND g.property_id = r.property_id
       ORDER BY g.check_in ASC, g.check_out ASC`
    );
    
    const bookings = result.rows.map(booking => {
      const nights = calculateNights(booking.check_in, booking.check_out);
      return {
        ...booking,
        nights: nights,
        price_per_night: parseFloat(booking.room_price),
        total_price: parseFloat(booking.total_price)
      };
    });
    
    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
});

router.get('/property/:propertyId', async (req, res) => {
  const { propertyId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM gbookings WHERE property_id = $1 ORDER BY check_in ASC, check_out ASC',
      [propertyId]
    );
    res.json({ success: true, bookings: result.rows });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
});

// Get booking with detailed information including room price
router.get('/:id', async (req, res) => {
  const bookingId = req.params.id;
  try {
    const result = await pool.query(
      `SELECT g.*, r.price as room_price, r.name as room_name
       FROM gbookings g
       JOIN rooms r ON g.room_id = r.id AND g.property_id = r.property_id
       WHERE g.id = $1`,
      [bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const booking = result.rows[0];
    const nights = calculateNights(booking.check_in, booking.check_out);
    
    res.json({ 
      success: true, 
      booking: {
        ...booking,
        nights: nights,
        price_per_night: parseFloat(booking.room_price),
        total_price: parseFloat(booking.total_price)
      }
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch booking' });
  }
});

// Check room availability
router.get('/check-availability', async (req, res) => {
  const { property_id, check_in, check_out } = req.query;

  if (!property_id || !check_in || !check_out) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required parameters: property_id, check_in, and check_out are required' 
    });
  }

  try {
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
    
    const roomIds = roomsResult.rows.map(room => room.id);
    
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

// Update booking status
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'confirmed', 'cancelled', 'declined'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status value'
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const bookingResult = await client.query(
      `SELECT * FROM gbookings WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (bookingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    const result = await client.query(
      `UPDATE gbookings SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (status === 'confirmed') {
      await client.query(
        `UPDATE rooms SET available = false 
         WHERE id = $1 AND property_id = $2`,
        [booking.room_id, booking.property_id]
      );
    } 
    else if (status === 'cancelled' || status === 'declined') {
      const otherBookings = await client.query(
        `SELECT 1 FROM gbookings
         WHERE room_id = $1
         AND id != $2
         AND status = 'confirmed'
         AND check_out > CURRENT_DATE`,
        [booking.room_id, id]
      );

      if (otherBookings.rows.length === 0) {
        await client.query(
          `UPDATE rooms SET available = true 
           WHERE id = $1 AND property_id = $2`,
          [booking.room_id, booking.property_id]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, booking: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  } finally {
    client.release();
  }
});

// Check-in endpoint
router.patch('/:id/check-in', async (req, res) => {
  const { id } = req.params;
  
  try {
    const client = await pool.connect();
    await client.query('BEGIN');
    
    const bookingResult = await client.query(
      `SELECT * FROM gbookings WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (bookingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];
    
    if (booking.status !== 'confirmed') {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Only confirmed bookings can be checked in' 
      });
    }

    if (booking.checkin_status === 'checked_in') {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Guest is already checked in' 
      });
    }

    const result = await client.query(
      `UPDATE gbookings 
       SET checkin_status = 'checked_in' 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );
    
    await client.query('COMMIT');
    res.json({ success: true, booking: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during check-in:', error);
    res.status(500).json({ success: false, message: 'Failed to process check-in' });
  }
});

// Check-out endpoint
router.patch('/:id/check-out', async (req, res) => {
  const { id } = req.params;
  
  try {
    const client = await pool.connect();
    await client.query('BEGIN');
    
    const bookingResult = await client.query(
      `SELECT * FROM gbookings WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (bookingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];
    
    if (booking.checkin_status !== 'checked_in') {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Guest is not checked in' 
      });
    }

    const result = await client.query(
      `UPDATE gbookings 
       SET checkin_status = 'checked_out' 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );
    
    await client.query(
      `UPDATE rooms SET available = true 
       WHERE id = $1`,
      [booking.room_id]
    );
    
    await client.query('COMMIT');
    res.json({ success: true, booking: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during check-out:', error);
    res.status(500).json({ success: false, message: 'Failed to process check-out' });
  }
});

module.exports = {
  router,
  bookingsTableExists
};