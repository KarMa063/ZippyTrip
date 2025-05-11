const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { router: guestHousePropertiesRouter, propertyTableExists } = require('./guesthouse/properties');
const { router: guestHouseRoomsRouter, createRoomsTable } = require('./guesthouse/rooms');
const { router: bookingsRoutes, bookingsTableExists } = require('./guesthouse/bookings');
const { router: reviewsRouter, createReviewsTable } = require('./guesthouse/reviews');
const { router: chatRouter, createChatMessagesTable } = require('./guesthouse/chat');
const { router: busRoutesRouter, createRoutesTable } = require('./routes/busRoutes');
const { router: busBookingsRouter, createBookingsTable } = require('./routes/bookingRoutes');
const { router: preferencesRouter, preferencesTableExists } = require('./routes/preferences');
const { router: usersRouter, usersTableExists } = require('./routes/users');
const { Pool } = require('pg');

// Load environment variables
dotenv.config();

const app = express();

// Configure PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

propertyTableExists(); 
createRoomsTable();
bookingsTableExists();
createReviewsTable();
preferencesTableExists();
usersTableExists();
// Initialize tables
createChatMessagesTable();

// Middleware
app.use(cors());
app.use(express.json());

// Mount the routers
app.use('/api/gproperties', guestHousePropertiesRouter);
app.use('/api/gproperties', guestHouseRoomsRouter);
app.use('/api/gproperties', reviewsRouter);
app.use('/api/messages', chatRouter);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/routes', busRoutesRouter);
app.use('/api/bus-bookings', busBookingsRouter);
app.use('/api/users', usersRouter);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Import the guesthouse authentication route
const guesthouseAuthRoutes = require('./routes/guesthouse-auth');

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// Use the guesthouse authentication route
app.use('/api/guesthouse-auth', guesthouseAuthRoutes);


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize tables
  await createRoutesTable();
  await createBookingsTable();
});