const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { router: propertyRoutes, propertyTableExists } = require('./guesthouse/properties');
const viewPropertyRoutes = require('./routes/viewproperties');
// Add bus service routes
// const busServiceRoutes = require('./bus/services');
// const bookingRoutes = require('./bus/bookings');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// USE THE ROUTERS
app.use('/properties', propertyRoutes);
app.use('/viewproperties', viewPropertyRoutes);
// app.use('/services', busServiceRoutes);
// app.use('/bookings', bookingRoutes);

// CALL THE TABLE CREATION
propertyTableExists();

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