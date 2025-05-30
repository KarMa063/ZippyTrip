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
        // First create the table if it doesn't exist
        await pool.query(`
            CREATE TABLE IF NOT EXISTS properties(
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                address TEXT,
                email TEXT,
                contact TEXT,
                images TEXT
            );
        `);

        // Then check if owner_id column exists and add it if it doesn't
        const columnCheck = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'properties' 
            AND column_name = 'owner_id';
        `);

        if (columnCheck.rows.length === 0) {
            await pool.query(`
                ALTER TABLE properties 
                ADD COLUMN owner_id VARCHAR;
            `);
            console.log("Added owner_id column to properties table");
        }

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
        owner_id
    } = req.body;

    const address = `${streetAddress}, ${city}, ${district}`;
    try {
        const result = await pool.query(
            `INSERT INTO properties 
            (name, description, address, email, contact, images, owner_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                name,
                description,
                address,
                email,
                phoneNumber,
                images,
                owner_id
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
                owner_id
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
    const { name, description, address, email, contact, images} = req.body;
    try {
        const result = await pool.query(
            `UPDATE properties SET 
                name = $1, 
                description = $2, 
                address = $3, 
                email = $4, 
                contact = $5, 
                images = $6, 
            WHERE id = $8
            RETURNING *`,
            [
                name,
                description,
                address,
                email,
                contact,
                images,
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

router.get('/:id/rooms', async (req, res) => {
    const { id } = req.params;
    try {
        const propertyResult = await pool.query('SELECT name FROM properties WHERE id = $1', [id]);
        if (propertyResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }

        const roomsResult = await pool.query(
            `SELECT 
                id, 
                name, 
                capacity, 
                CAST(price AS DECIMAL(10,2)) AS price, 
                available AS availability, 
                amenities, 
                images 
            FROM rooms 
            WHERE property_id = $1`,
            [id]
        );
        res.status(200).json({
            success: true,
            guestHouse: { name: propertyResult.rows[0].name },
            rooms: roomsResult.rows
        });
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

module.exports = {
    router,
    propertyTableExists
};
