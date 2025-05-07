const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// Create attractions table if it doesn't exist
async function createAttractionsTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS attractions(
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                location TEXT NOT NULL,
                description TEXT,
                image TEXT,
                rating DECIMAL(2,1),
                properties INTEGER,
                featured BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Attractions table checked/created successfully.");
    } catch (error) {
        console.error("Error checking or creating the attractions table:", error);
    }
}

// Initialize table
createAttractionsTable();

// Get all attractions
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM attractions ORDER BY created_at DESC');
        res.status(200).json({ success: true, attractions: result.rows });
    } catch (error) {
        console.error('Error fetching attractions:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Get attraction by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM attractions WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Attraction not found" });
        }
        res.status(200).json({ success: true, attraction: result.rows[0] });
    } catch (error) {
        console.error('Error fetching attraction:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Add a new attraction
router.post('/', async (req, res) => {
    const { name, location, description, image, rating, properties, featured } = req.body;
    
    // Validation
    if (!name || !location) {
        return res.status(400).json({ 
            success: false, 
            message: "Name and location are required fields" 
        });
    }
    
    // Validate rating is a number between 0 and 5
    if (rating !== undefined && (isNaN(parseFloat(rating)) || parseFloat(rating) < 0 || parseFloat(rating) > 5)) {
        return res.status(400).json({ 
            success: false, 
            message: "Rating must be a number between 0 and 5" 
        });
    }
    
    // Validate properties is a positive number
    if (properties !== undefined && (isNaN(parseInt(properties)) || parseInt(properties) < 0)) {
        return res.status(400).json({ 
            success: false, 
            message: "Properties must be a positive number" 
        });
    }
    
    try {
        const result = await pool.query(
            `INSERT INTO attractions 
            (name, location, description, image, rating, properties, featured)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [name, location, description, image, 
             rating !== undefined ? parseFloat(rating) : null, 
             properties !== undefined ? parseInt(properties) : null, 
             featured || false]
        );
        res.status(201).json({ success: true, attraction: result.rows[0] });
    } catch (error) {
        console.error("Error adding attraction:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Update attraction
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, location, description, image, rating, properties, featured } = req.body;
    
    try {
        const result = await pool.query(
            `UPDATE attractions SET 
                name = $1, 
                location = $2, 
                description = $3, 
                image = $4, 
                rating = $5, 
                properties = $6,
                featured = $7
            WHERE id = $8
            RETURNING *`,
            [name, location, description, image, rating, properties, featured, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Attraction not found" });
        }
        
        res.status(200).json({ success: true, attraction: result.rows[0] });
    } catch (error) {
        console.error("Error updating attraction:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Delete attraction
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query('DELETE FROM attractions WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Attraction not found" });
        }
        
        res.status(200).json({ success: true, message: "Attraction deleted successfully" });
    } catch (error) {
        console.error("Error deleting attraction:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

module.exports = {
    router,
    createAttractionsTable
};