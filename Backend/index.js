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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});