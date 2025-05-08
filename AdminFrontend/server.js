require('dotenv').config(); // Import dotenv and load environment variables

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Use the PORT from the environment variable, fallback to 3000
const DATABASE_URL = process.env.DATABASE_URL; // Use the DATABASE_URL from the environment variable

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Request logger middleware — must be before routes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Data file path (if you're still using JSON file for mock data)
const dataFilePath = path.join(__dirname, 'destinations.json');

// Helper function to read destinations data
async function readDestinations() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return []; // Return empty array if file not found or invalid
  }
}

// Helper function to write destinations data
async function writeDestinations(destinations) {
  await fs.writeFile(dataFilePath, JSON.stringify(destinations, null, 2), 'utf8');
}

// Routes
// Get all destinations
app.get('/api/destinations', async (req, res) => {
  try {
    const destinations = await readDestinations();
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch destinations' });
  }
});

// Get a single destination
app.get('/api/destinations/:id', async (req, res) => {
  try {
    const destinations = await readDestinations();
    const destination = destinations.find(d => d.id === parseInt(req.params.id));
    
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }
    
    res.json(destination);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch destination' });
  }
});

// Create a new destination
app.post('/api/destinations', async (req, res) => {
  try {
    const destinations = await readDestinations();
    const newId = destinations.length > 0 ? Math.max(...destinations.map(d => d.id)) + 1 : 1;
    
    const newDestination = {
      id: newId,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    destinations.push(newDestination);
    await writeDestinations(destinations);
    
    res.status(201).json(newDestination);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create destination' });
  }
});

// Update a destination
app.put('/api/destinations/:id', async (req, res) => {
  try {
    const destinations = await readDestinations();
    const id = parseInt(req.params.id);
    const index = destinations.findIndex(d => d.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Destination not found' });
    }
    
    const updatedDestination = {
      ...destinations[index],
      ...req.body,
      id: id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    destinations[index] = updatedDestination;
    await writeDestinations(destinations);
    
    res.json(updatedDestination);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update destination' });
  }
});

// Delete a destination
app.delete('/api/destinations/:id', async (req, res) => {
  try {
    const destinations = await readDestinations();
    const id = parseInt(req.params.id);
    const filteredDestinations = destinations.filter(d => d.id !== id);
    
    if (filteredDestinations.length === destinations.length) {
      return res.status(404).json({ error: 'Destination not found' });
    }
    
    await writeDestinations(filteredDestinations);
    
    res.json({ message: 'Destination deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete destination' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Backend server started!');
});
