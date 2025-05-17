const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Create Routes Table if it doesn't exist
async function createRoutesTable() {
  try {
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      
      CREATE TABLE IF NOT EXISTS routes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT,
        origin TEXT NOT NULL,
        destination TEXT NOT NULL,
        distance NUMERIC,
        duration TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE UNIQUE INDEX IF NOT EXISTS routes_pkey ON routes USING BTREE(id);
      `);
    console.log("Routes and schedules tables created or already exist.");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
}

// GET route to search for routes
router.get('/search', async (req, res) => {
  const { from, to, date } = req.query;
  
  try {
    let query = 'SELECT * FROM routes WHERE is_active = true';
    const queryParams = [];
    
    if (from) {
      queryParams.push(from);
      query += ` AND origin ILIKE $${queryParams.length}`;
    }
    
    if (to) {
      queryParams.push(to);
      query += ` AND destination ILIKE $${queryParams.length}`;
    }
    
    const result = await pool.query(query, queryParams.map(param => `%${param}%`));
    
    // If date is provided, we'll use it to filter available schedules
    let routes = result.rows;
    
    res.status(200).json({ 
      success: true, 
      routes: routes,
      departure_date: date // Include the departure date in the response
    });
  } catch (error) {
    console.error("Error searching routes:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// POST route to create a new route
router.post('/', async (req, res) => {
  const { name, origin, destination, distance, duration } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO routes 
        (name, origin, destination, distance, duration)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, origin, destination, distance, duration]
    );
    
    res.status(201).json({ 
      success: true, 
      route: result.rows[0] 
    });
  } catch (error) {
    console.error("Error creating route:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// GET route to retrieve all routes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM routes WHERE is_active = true');
    
    res.status(200).json({ 
      success: true, 
      routes: result.rows 
    });
  } catch (error) {
    console.error("Error fetching routes:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// GET route to retrieve a specific route by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('SELECT * FROM routes WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Route not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      route: result.rows[0] 
    });
  } catch (error) {
    console.error("Error fetching route:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// PUT route to update a route
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, origin, destination, distance, duration, is_active } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE routes
       SET name = $1, origin = $2, destination = $3, distance = $4, duration = $5, 
           is_active = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [name, origin, destination, distance, duration, is_active, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Route not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      route: result.rows[0] 
    });
  } catch (error) {
    console.error("Error updating route:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// DELETE route to deactivate a route (soft delete)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      `UPDATE routes
       SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Route not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Route deactivated successfully" 
    });
  } catch (error) {
    console.error("Error deactivating route:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// GET route to search for schedules
router.get('/schedules/search', async (req, res) => {
  const { from, to, date } = req.query;
  
  try {
    let query = `
      SELECT 
        s.id, 
        s.departure_time, 
        s.arrival_time, 
        s.fare, 
        s.available_seats,
        r.origin, 
        r.destination, 
        r.name as route_name
      FROM schedules s
      JOIN routes r ON s.route_id = r.id
      WHERE s.is_active = true
    `;
    
    const queryParams = [];
    
    if (from) {
      queryParams.push(from);
      query += ` AND r.origin ILIKE $${queryParams.length}`;
    }
    
    if (to) {
      queryParams.push(to);
      query += ` AND r.destination ILIKE $${queryParams.length}`;
    }
    
    if (date) {
      queryParams.push(date);
      query += ` AND DATE(s.departure_time) = $${queryParams.length}`;
    }
    
    query += ` ORDER BY s.departure_time ASC`;
    
    const result = await pool.query(
      query, 
      queryParams.map(param => param === date ? param : `%${param}%`)
    );
    
    res.status(200).json({ 
      success: true, 
      schedules: result.rows 
    });
  } catch (error) {
    console.error("Error searching schedules:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// GET route to retrieve a specific schedule by ID
router.get('/schedules/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT 
        s.id, 
        s.departure_time, 
        s.arrival_time, 
        s.fare, 
        s.available_seats,
        s.bus_id,
        s.driver_id,
        r.id as route_id,
        r.origin, 
        r.destination, 
        r.name as route_name
      FROM schedules s
      JOIN routes r ON s.route_id = r.id
      WHERE s.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Schedule not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      schedule: result.rows[0] 
    });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// POST route to create a new schedule
router.post('/schedules', async (req, res) => {
  const { 
    route_id, 
    bus_id, 
    departure_time, 
    arrival_time, 
    fare, 
    available_seats,
    driver_id 
  } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO schedules 
        (route_id, bus_id, departure_time, arrival_time, fare, available_seats, driver_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [route_id, bus_id, departure_time, arrival_time, fare, available_seats, driver_id]
    );
    
    res.status(201).json({ 
      success: true, 
      schedule: result.rows[0] 
    });
  } catch (error) {
    console.error("Error creating schedule:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// PUT route to update a schedule
router.put('/schedules/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    route_id, 
    bus_id, 
    departure_time, 
    arrival_time, 
    fare, 
    available_seats,
    is_active,
    driver_id 
  } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE schedules
       SET route_id = $1, 
           bus_id = $2, 
           departure_time = $3, 
           arrival_time = $4, 
           fare = $5, 
           available_seats = $6,
           is_active = $7,
           driver_id = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [route_id, bus_id, departure_time, arrival_time, fare, available_seats, is_active, driver_id, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Schedule not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      schedule: result.rows[0] 
    });
  } catch (error) {
    console.error("Error updating schedule:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// DELETE route to cancel a schedule (soft delete)
router.delete('/schedules/:id', async (req, res) => {
  const { id } = req.params;
  const { cancellation_reason } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE schedules
       SET is_active = false, 
           cancellation_reason = $1, 
           cancelled_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [cancellation_reason || 'No reason provided', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Schedule not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Schedule cancelled successfully",
      schedule: result.rows[0]
    });
  } catch (error) {
    console.error("Error cancelling schedule:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// GET route to retrieve all schedules for a specific route
router.get('/routes/:routeId/schedules', async (req, res) => {
  const { routeId } = req.params;
  const { date } = req.query;
  
  try {
    let query = `
      SELECT 
        s.id, 
        s.departure_time, 
        s.arrival_time, 
        s.fare, 
        s.available_seats,
        r.origin, 
        r.destination, 
        r.name as route_name
      FROM schedules s
      JOIN routes r ON s.route_id = r.id
      WHERE s.route_id = $1 AND s.is_active = true
    `;
    
    const queryParams = [routeId];
    
    if (date) {
      queryParams.push(date);
      query += ` AND DATE(s.departure_time) = $2`;
    }
    
    query += ` ORDER BY s.departure_time ASC`;
    
    const result = await pool.query(query, queryParams);
    
    res.status(200).json({ 
      success: true, 
      schedules: result.rows 
    });
  } catch (error) {
    console.error("Error fetching schedules for route:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

router.get('/schedules/search', async (req, res) => {
  const { route_id, departure_date } = req.query;
  
  try {
    let query = 'SELECT * FROM schedules WHERE is_active = true';
    const queryParams = [];
    
    if (route_id) {
      queryParams.push(route_id);
      query += ` AND route_id = $${queryParams.length}`;
    }
    
    if (departure_date) {
      queryParams.push(departure_date);
      query += ` AND DATE(departure_time) = $${queryParams.length}`;
    }
    
    query += ' ORDER BY departure_time ASC';
    
    const result = await pool.query(query, queryParams);
    
    res.status(200).json({ 
      success: true, 
      schedules: result.rows,
      departure_date: departure_date
    });
  } catch (error) {
    console.error("Error searching schedules:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// Export the router and table creation function
module.exports = {
  router,
  createRoutesTable,
};