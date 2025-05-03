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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
