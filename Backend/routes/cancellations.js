const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// POST endpoint to handle ticket cancellations
router.post('/cancel', async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Booking ID is required'
      });
    }

    // Update the booking status to 'cancelled' in the database
    const result = await pool.query(
      `UPDATE bookings 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found'
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Ticket cancelled successfully',
      booking: result.rows[0]
    });
  } catch (error) {
    console.error('Error cancelling ticket:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel ticket',
      error: error.message
    });
  }
});

module.exports = router;