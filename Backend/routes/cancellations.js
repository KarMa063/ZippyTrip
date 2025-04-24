const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// POST endpoint to handle ticket cancellations
router.post('/cancel', async (req, res) => {
  try {
    const {
      id,
      busId,
      from,
      to,
      departure,
      arrival,
      date,
      operator,
      price,
      seats,
      passengerName,
      busType,
      status,
      bookingDate
    } = req.body;

    // Insert cancellation into Supabase
    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          id,
          user_id: passengerName, // Using passengerName as user_id for simplicity
          schedules: {
            routes: {
              name: `${from} to ${to}`,
              origin: from,
              destination: to
            },
            buses: {
              registration_number: busId
            }
          },
          seat_numbers: seats.map(seat => seat.split('-')[1]),
          total_fare: price,
          status: 'cancelled',
          payment_status: 'pending',
          booking_date: bookingDate,
          updated_at: new Date().toISOString()
        }
      ]);

    if (error) throw error;

    res.status(200).json({ 
      success: true, 
      message: 'Ticket cancelled successfully',
      data
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