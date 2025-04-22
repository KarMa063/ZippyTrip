const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Configure Supabase for the Bus Operator project
const SUPABASE_URL = 'https://YOUR_OPERATOR_SUPABASE_URL.supabase.co';
const SUPABASE_SERVICE_KEY = 'YOUR_OPERATOR_SERVICE_ROLE_KEY'; // Use service role for write access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Endpoint to receive cancellation data from the user app
app.post('/api/cancellations', async (req, res) => {
  const cancellation = req.body;

  // Insert cancellation into the operator's Supabase bookings table
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled', ...cancellation })
    .eq('id', cancellation.id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json({ success: true, data });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Cancellation sync server running on port ${PORT}`);
});