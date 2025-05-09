const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const cancellationsRouter = require('./routes/cancellations');

const app = express();
const PORT = process.env.PORT || 5000;

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
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});