const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure the table exists before starting the server
const { router: propertyRoutes, propertyTableExists } = require('./guesthouse/properties');
const { router: roomsRoutes, createRoomsTable } = require('./guesthouse/rooms');
propertyTableExists(); 
createRoomsTable();

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Backend is working!');
});

app.use('/api/gproperties', propertyRoutes);
app.use('/api/gproperties', roomsRoutes);

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
