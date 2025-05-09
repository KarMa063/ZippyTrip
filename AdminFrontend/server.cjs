import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8087;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Send all requests to index.html so that client-side routing works
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data file path
const dataFilePath = path.join(__dirname, 'destinations.json');

// Helper function to read destinations data
async function readDestinations() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    return [];
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data file path
const dataFilePath = path.join(__dirname, 'destinations.json');

// Helper function to read destinations data
async function readDestinations() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    return [];
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data file path
const dataFilePath = path.join(__dirname, 'destinations.json');

// Helper function to read destinations data
async function readDestinations() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    return [];
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data file path
const dataFilePath = path.join(__dirname, 'destinations.json');

// Helper function to read destinations data
async function readDestinations() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    return [];
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data file path
const dataFilePath = path.join(__dirname, 'destinations.json');

// Helper function to read destinations data
async function readDestinations() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    return [];
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data file path
const dataFilePath = path.join(__dirname, 'destinations.json');

// Helper function to read destinations data
async function readDestinations() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    return [];
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data file path
const dataFilePath = path.join(__dirname, 'destinations.json');

// Helper function to read destinations data
async function readDestinations() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    return [];
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data file path
const dataFilePath = path.join(__dirname, 'destinations.json');

// Helper function to read destinations data
async function readDestinations() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    return [];
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data file path
const dataFilePath = path.join(__dirname, 'destinations.json');

// Helper function to read destinations data
async function readDestinations() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    return [];
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data file path
const dataFilePath = path.join(__dirname, 'destinations.json');

// Helper function to read destinations data
async function readDestinations() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    return [];
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data file path
const dataFilePath = path.join(__dirname, 'destinations.json');

// Helper function to read destinations data
async function readDestinations() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    return [];
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data file path
const dataFilePath = path.join(__dirname, 'destinations.json');

// Helper function to read destinations data
async function readDestinations() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    return [];
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data file path
const dataFilePath = path.join(__dirname, 'destinations.json');

// Helper function to read destinations data
async function readDestinations() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    return [];
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data file path
const dataFilePath = path.join(__dirname, 'destinations.json');

// Helper function to read destinations data
async function readDestinations() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    return [];
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data file path
const dataFilePath = path.join(__dirname, 'destinations.json');

// Helper function to read destinations data
async function readDestinations() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    return [];
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data file path
const dataFilePath = path.join(__dirname, 'destinations.json');

// Helper function to read destinations data
async function readDestinations() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    return [];
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data file path
const dataFilePath = path.join(__dirname, 'destinations.json');

// Helper function to read destinations data
async function readDestinations() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    return [];
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data file path
const dataFilePath = path.join(__dirname, 'destinations.json');

// Helper function to read destinations data
async function readDestinations() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    return [];
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