const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Get all properties
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id,
                name,
                description,
                address,
                email,
                contact,
                images,
                rooms
            FROM properties
        `);
        
        res.status(200).json({ success: true, properties: result.rows });
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Get property by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM properties WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }
        
        res.status(200).json({ success: true, property: result.rows[0] });
    } catch (error) {
        console.error('Error fetching property:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

module.exports = router;