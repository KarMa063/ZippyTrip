const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const cancellationsRouter = require('./routes/cancellations');
const http = require('http');
const { router: chatRouter, setupWebSocketServer } = require('./guesthouse/chat');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Set up WebSocket server
const wss = setupWebSocketServer(server);

// Routes
app.get('/', (req, res) => {
  res.send('ZippyTrip Backend API is running');
});

// Use chat router
app.use('/api/messages', chatRouter);

// Import the guesthouse cancellations router
const guesthouseCancellationsRouter = require('./routes/guesthouse-cancellations');

app.use('/api/cancellations', cancellationsRouter);

app.use('/api/guesthouse-cancellations', guesthouseCancellationsRouter);

// Define PORT
const PORT = process.env.PORT || 5000;

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});