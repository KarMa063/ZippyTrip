const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const router = express.Router();

// Initialize PostgreSQL client with connection string
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// Ensure the preferences table exists (with correct data types)
async function preferencesTableExists() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS preferences (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) UNIQUE,
                travel_style VARCHAR(100),
                bus_comfort VARCHAR(100),
                travel_time VARCHAR(100),
                amenities TEXT[] 
            );
        `);
        console.log("Preferences table checked/created successfully.");
    } catch (error) {
        console.error("Error checking or creating preferences table:", error);
    }
}

// POST /api/preferences
router.post("/", async (req, res) => {
    const {
        user_id,
        travel_style,
        bus_comfort,
        travel_time,
        amenities,
    } = req.body;

    // Check for required fields
    if (!user_id) {
        return res.status(400).json({ success: false, message: "Missing user_id" });
    }

    try {
        // Insert preferences into database
        const result = await pool.query(
            `INSERT INTO preferences 
            (user_id, travel_style, bus_comfort, travel_time, amenities)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                user_id,
                travel_style,
                bus_comfort,
                travel_time,
                amenities || [], 
            ]
        );

        // Send response with inserted preferences
        res.status(201).json({ success: true, preferences: result.rows[0] });
    } catch (error) {
        console.error("Error inserting preferences:", error);
        res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
});

// Export router and preferencesTableExists function
module.exports = {
    router,
    preferencesTableExists,
};
