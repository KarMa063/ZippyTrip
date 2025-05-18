const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { router: guestHousePropertiesRouter, propertyTableExists } = require('./guesthouse/properties');
const { router: guestHouseRoomsRouter, createRoomsTable } = require('./guesthouse/rooms');
const { router: bookingsRoutes, bookingsTableExists } = require('./guesthouse/bookings');
const { router: reviewsRouter, createReviewsTable } = require('./guesthouse/reviews');
const { router: chatRouter, createChatMessagesTable, setupWebSocketServer } = require('./guesthouse/chat');
const { router: busRoutesRouter, createRoutesTable } = require('./routes/busRoutes');
const { router: busBookingsRouter, createBookingsTable } = require('./routes/bookingRoutes');
const { router: preferencesRouter, preferencesTableExists } = require('./routes/preferences');
const { router: usersRouter, usersTableExists } = require('./routes/users');
const cancellationsRouter = require('./routes/cancellations');
const { Pool } = require('pg');

// Load environment variables
dotenv.config();

const app = express();

// Create HTTP server
const server = http.createServer(app);

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
app.use('/api/preferences', preferencesRouter);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'ZippyTrip Backend API is running' });
});


const guesthouseAuthRoutes = require('./routes/guesthouse-auth');
const guesthouseCancellationsRouter = require('./routes/guesthouse-cancellations');
app.use('/api/cancellations', cancellationsRouter);
app.use('/api/guesthouse-cancellations', guesthouseCancellationsRouter);
app.use('/api/guesthouse-auth', guesthouseAuthRoutes);

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
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize tables
  await createRoutesTable();
  await createBookingsTable();
});