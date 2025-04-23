require('dotenv').config(); // Load .env variables first
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const { sendRealEmail } = require('./emailSender'); // Import the email function

const app = express();
const server = http.createServer(app);

// Configure CORS - Adjust origin(s) as needed for your frontend apps
// Make sure these URLs match where your Admin and User frontends are running
const allowedOrigins = [
    "http://localhost:3000", // Example default React port
    "http://localhost:3001", // Example potential second frontend port
    "http://localhost:5173", // Example default Vite port (check your Busopearatoradmin)
    // Add the URL for your User Frontend (Frontend\project) if different
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true // If you need to handle cookies or authorization headers
}));

// Middleware to parse JSON request bodies
app.use(express.json());

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // Use the same origins
    methods: ["GET", "POST"],
    credentials: true
  }
});

// --- Database Setup (Placeholder) ---
// TODO: Connect to your chosen database (e.g., MongoDB, PostgreSQL, SQLite)
// const db = require('./database'); // Example

// --- In-Memory Data Store (Temporary Placeholder) ---
// Replace this with actual database interaction
let routes = [];
let bookings = [];
let nextRouteId = 1;
let nextBookingId = 1;

// --- API Endpoints ---

// GET /api/routes - Fetch all routes
app.get('/api/routes', async (req, res) => {
  try {
    // TODO: Replace with actual database query
    // const routesFromDb = await db.query('SELECT * FROM routes');
    res.json(routes); // Send temporary in-memory data
  } catch (err) {
    console.error("Error fetching routes:", err);
    res.status(500).json({ message: "Error fetching routes" });
  }
});

// POST /api/routes - Add a new route (Admin)
app.post('/api/routes', async (req, res) => {
  try {
    const newRoute = { id: nextRouteId++, ...req.body }; // Add ID and other data from request
    // TODO: Replace with actual database insert
    // const insertedRoute = await db.query('INSERT INTO routes (...) VALUES (...) RETURNING *', [...]);
    routes.push(newRoute); // Add to temporary in-memory data
    console.log("Route added:", newRoute);

    // Emit event to all connected clients about the new route
    io.emit('route_added', newRoute);
    console.log("Emitted route_added");

    res.status(201).json(newRoute);
  } catch (err) {
    console.error("Error adding route:", err);
    res.status(500).json({ message: "Error adding route" });
  }
});

// PUT /api/routes/:id - Edit an existing route (Admin)
app.put('/api/routes/:id', async (req, res) => {
    const routeId = parseInt(req.params.id, 10);
    try {
        // TODO: Replace with actual database update
        const routeIndex = routes.findIndex(r => r.id === routeId);
        if (routeIndex === -1) {
            return res.status(404).json({ message: "Route not found" });
        }
        const updatedRoute = { ...routes[routeIndex], ...req.body };
        routes[routeIndex] = updatedRoute; // Update temporary in-memory data
        console.log("Route updated:", updatedRoute);

        // Emit event to all connected clients
        io.emit('route_updated', updatedRoute);
        console.log("Emitted route_updated");

        res.json(updatedRoute);
    } catch (err) {
        console.error("Error updating route:", err);
        res.status(500).json({ message: "Error updating route" });
    }
});


// DELETE /api/routes/:id - Delete a route (Admin)
app.delete('/api/routes/:id', async (req, res) => {
    const routeId = parseInt(req.params.id, 10);
    try {
        // TODO: Replace with actual database delete
        const initialLength = routes.length;
        routes = routes.filter(r => r.id !== routeId); // Remove from temporary in-memory data

        if (routes.length === initialLength) {
             return res.status(404).json({ message: "Route not found" });
        }
        console.log("Route deleted:", routeId);

        // Emit event to all connected clients
        io.emit('route_deleted', { id: routeId });
         console.log("Emitted route_deleted");

        res.status(204).send(); // No content on successful delete
    } catch (err) {
        console.error("Error deleting route:", err);
        res.status(500).json({ message: "Error deleting route" });
    }
});


// POST /api/bookings - Create a new booking (User)
app.post('/api/bookings', async (req, res) => {
    try {
        const newBooking = {
            id: nextBookingId++,
            ...req.body,
            status: 'confirmed', // Default status
            bookingTime: new Date()
        };
        // TODO: Replace with actual database insert
        bookings.push(newBooking); // Add to temporary in-memory data
        console.log("Booking created:", newBooking);

        // Optionally emit an event if admins need real-time booking updates
        // io.emit('booking_created', newBooking);

        // Example: Send confirmation email
        if (newBooking.userEmail) {
             await sendRealEmail(
                 newBooking.userEmail,
                 'Your Bus Booking Confirmation',
                 `Booking confirmed for route ${newBooking.routeId}. Booking ID: ${newBooking.id}`
             );
        }

        res.status(201).json(newBooking);
    } catch (err) {
        console.error("Error creating booking:", err);
        res.status(500).json({ message: "Error creating booking" });
    }
});

// GET /api/bookings/cancelled - Get cancelled bookings (Admin)
app.get('/api/bookings/cancelled', async (req, res) => {
    try {
        // TODO: Replace with actual database query filtering by status
        const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
        res.json(cancelledBookings);
    } catch (err) {
        console.error("Error fetching cancelled bookings:", err);
        res.status(500).json({ message: "Error fetching cancelled bookings" });
    }
});


// --- Socket.IO Connection Handling ---
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for a cancellation event from a user client
  socket.on('cancel_booking', async (data) => {
    const { bookingId } = data; // Expect an object like { bookingId: 123 }
    if (!bookingId) {
        console.error("Cancellation request received without bookingId");
        socket.emit('cancellation_error', { message: 'Booking ID is required' });
        return;
    }

    try {
      console.log(`Received cancellation request for booking: ${bookingId}`);
      // TODO: Replace with actual database update
      const bookingIndex = bookings.findIndex(b => b.id === bookingId);
      if (bookingIndex === -1) {
          console.error(`Booking not found for cancellation: ${bookingId}`);
          socket.emit('cancellation_error', { bookingId, message: 'Booking not found' });
          return;
      }

      if (bookings[bookingIndex].status === 'cancelled') {
          console.log(`Booking ${bookingId} already cancelled.`);
          // Optionally inform the client it's already cancelled
          socket.emit('cancellation_info', { bookingId, message: 'Booking already cancelled' });
          return;
      }

      bookings[bookingIndex].status = 'cancelled'; // Update temporary in-memory data
      const cancelledBooking = bookings[bookingIndex];
      console.log("Booking cancelled:", cancelledBooking);

      // Emit an event to all connected clients (or specifically admin clients)
      io.emit('booking_cancelled', cancelledBooking); // Send the whole cancelled booking object
      console.log(`Emitted booking_cancelled for booking: ${bookingId}`);

      // Acknowledge successful cancellation to the sender
      socket.emit('cancellation_success', { bookingId });

      // Example: Send cancellation confirmation email
      if (cancelledBooking.userEmail) {
          await sendRealEmail(
              cancelledBooking.userEmail,
              'Your Bus Booking Cancellation',
              `Your booking (ID: ${cancelledBooking.id}) for route ${cancelledBooking.routeId} has been cancelled.`
          );
      }

    } catch (err) {
      console.error(`Error handling cancel_booking for ${bookingId}:`, err);
      // Optionally emit an error back to the specific client
      socket.emit('cancellation_error', { bookingId, message: 'Failed to cancel booking due to server error' });
    }
  });

  // Add listeners for other events if needed

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000; // Use environment variable or default port
server.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
  console.log(`Allowed frontend origins: ${allowedOrigins.join(', ')}`);
});