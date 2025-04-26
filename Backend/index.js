const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure the table exists before starting the server
const { router: propertyRoutes, propertyTableExists } = require('./guesthouse/properties');
propertyTableExists();  // Ensure table creation before setting up routes

app.use(cors());  // You can configure CORS if needed
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Backend is working!');
});

app.use('/api/gproperties', propertyRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
