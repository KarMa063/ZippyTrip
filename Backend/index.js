const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { router: guestHouseRoomsRouter, createRoomsTable } = require('./guesthouse/rooms');
const { router: bookingsRoutes, bookingsTableExists } = require('./guesthouse/bookings');
const { router: busRoutesRouter, createRoutesTable } = require('./routes/busRoutes');
const { router: busBookingsRouter, createBookingsTable } = require('./routes/bookingRoutes');
const { Pool } = require('pg');

// Load environment variables
dotenv.config();

const app = express();


// Configure PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

const { router: propertyRoutes, propertyTableExists } = require('./guesthouse/properties');
const { router: gbookingsRoutes, gbookingsTableExists } = require('./guesthouse/gbookings');
const { router: preferencesRoutes, preferencesTableExists } = require('./routes/preferences');
const { router: usersRoutes, usersTableExists } = require('./routes/users');

propertyTableExists(); 
createRoomsTable();
gbookingsTableExists();
preferencesTableExists();
usersTableExists();

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});


// Properties routes
app.get('/api/gproperties', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM properties');
    res.json({ success: true, properties: result.rows });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch properties' });
  }
});

// app.use('/api/gproperties', propertyRoutes);
// app.use('/api/gproperties', roomsRoutes);
// app.use('/api/gbookings', gbookingsRoutes);
// app.use('/api/preferences', preferencesRoutes);
// app.use('/api/users', usersRoutes);

app.get('/api/gproperties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM properties WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    
    res.json({ success: true, property: result.rows[0] });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch property' });
  }
});

// Mount the routers
app.use('/api/gproperties', guestHouseRoomsRouter);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/routes', busRoutesRouter);
app.use('/api/bus-bookings', busBookingsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize tables
  await createRoutesTable();
  await createBookingsTable();
});