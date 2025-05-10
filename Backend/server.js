const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const cancellationsRouter = require('./routes/cancellations');
const http = require('http');
const { router: chatRouter, setupWebSocketServer } = require('./guesthouse/chat');

// Create HTTP server
const server = http.createServer(app);

// Set up WebSocket server
const wss = setupWebSocketServer(server);

// Use chat router
app.use('/api/gproperties', chatRouter);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('ZippyTrip Backend API is running');
});

// Use the cancellations router
app.use('/api/cancellations', cancellationsRouter);

// Start server
// Change app.listen to server.listen
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});