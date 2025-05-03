const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// Ensure the properties table exists
async function propertyTableExists() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS properties(
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                address TEXT,
                email TEXT,
                contact TEXT,
                images JSONB,
                rooms INTEGER
            );
        `);
        console.log("Properties table checked/created successfully.");
    } catch (error) {
        console.error("Error checking or creating the table:", error);
    }
}

// Add a new property
router.post("/addproperty", async (req, res) => {
    const {
        name,
        description,
        streetAddress,
        city,
        district,
        email,
        phoneNumber,
        images,
        rooms,
    } = req.body;

    const address = `${streetAddress}, ${city}, ${district}`;
    try {
        const result = await pool.query(
            `INSERT INTO properties 
            (name, description, address, email, contact, images, rooms)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                name,
                description,
                address,
                email,
                phoneNumber,
                JSON.stringify(images),
                rooms,
            ]
        );
        res.status(201).json({ success: true, property: result.rows[0] });
    } catch (error) {
        console.error("Error inserting property: ", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
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

// Delete property by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM properties WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }
        res.status(200).json({ success: true, message: "Property deleted" });
    } catch (error) {
        console.error("Error deleting property:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Update property based on ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, address, email, contact, images, rooms } = req.body;
    try {
        const result = await pool.query(
            `UPDATE properties SET 
                name = $1, 
                description = $2, 
                address = $3, 
                email = $4, 
                contact = $5, 
                images = $6, 
                rooms = $7
            WHERE id = $8
            RETURNING *`,
            [
                name,
                description,
                address,
                email,
                contact,
                JSON.stringify(images),
                rooms,
                id
            ]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }
        res.status(200).json({ success: true, property: result.rows[0] });
    } catch (error) {
        console.error("Error updating property:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

module.exports = {
    router,
    propertyTableExists
};
