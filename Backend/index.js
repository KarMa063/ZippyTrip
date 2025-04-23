// Backend/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is working!');
});

// Cancellation endpoint
app.post('/api/cancellations', (req, res) => {
  const cancellationData = req.body;
  
  // Forward the cancellation to the Bus Operator Admin
  fetch('http://localhost:3001/api/cancellations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cancellationData),
  })
  .then(response => response.json())
  .then(data => {
    res.json({ success: true, message: 'Cancellation forwarded to operator', data });
  })
  .catch(error => {
    console.error('Error forwarding cancellation:', error);
    res.status(500).json({ success: false, message: 'Failed to forward cancellation' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
