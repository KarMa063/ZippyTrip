const express = require('express');
const pool = require('./db.cjs');

const router = express.Router();

// Ensure the attractions table exists
async function attractionTableExists() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS attractions(
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                location TEXT,
                category TEXT,
                price NUMERIC,
                rating NUMERIC,
                image TEXT,
                status TEXT
            );
        `);
        console.log("Attractions table checked/created successfully.");
    } catch (error) {
        console.error("Error creating attractions table:", error);
    }
}

// Add a new attraction
router.post("/addattraction", async (req, res) => {
    const {
        name,
        location,
        category,
        price,
        rating,
        image,
        status
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO attractions 
            (name, location, category, price, rating, image, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [name, location, category, price, rating, image, status]
        );
        res.status(201).json({ success: true, attraction: result.rows[0] });
    } catch (error) {
        console.error("Error inserting attraction: ", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Get all attractions
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM attractions`);
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

// Delete attraction by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM attractions WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Attraction not found" });
        }
        res.status(200).json({ success: true, message: "Attraction deleted" });
    } catch (error) {
        console.error("Error deleting attraction:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Update attraction by ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const {
        name,
        location,
        category,
        price,
        rating,
        image,
        status
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE attractions SET 
                name = $1,
                location = $2,
                category = $3,
                price = $4,
                rating = $5,
                image = $6,
                status = $7
            WHERE id = $8
            RETURNING *`,
            [name, location, category, price, rating, image, status, id]
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

// Health check route to verify DB connection
router.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({ success: true, message: 'Database connection successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database connection failed', error: error.message });
    }
});

module.exports = {
    router,
    attractionTableExists
};