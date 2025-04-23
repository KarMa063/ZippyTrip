const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('ZippyTrip Backend API is running');
});

// Cancellation endpoint
app.post('/api/cancellations/cancel', (req, res) => {
  const cancellationData = req.body;
  
  // Forward the cancellation to the Bus Operator Admin
  fetch('http://localhost:3001/api/cancellations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cancellationData),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    res.json({ success: true, message: 'Cancellation forwarded to operator', data });
  })
  .catch(error => {
    console.error('Error forwarding cancellation:', error);
    res.status(500).json({ success: false, message: 'Failed to forward cancellation' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});