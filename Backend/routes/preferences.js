const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// Ensure the preferences table exists
async function preferencesTableExists() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS preferences (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) UNIQUE,
                travel_style VARCHAR(100),
                bus_comfort VARCHAR(100),
                travel_time VARCHAR(100),
                stay_type VARCHAR(100),
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
        stay_type,
        amenities,
    } = req.body;

    if (!user_id) {
        return res.status(400).json({ success: false, message: "Missing user_id" });
    }

    try {
        const result = await pool.query(
            `INSERT INTO preferences 
            (user_id, travel_style, bus_comfort, travel_time, stay_type, amenities)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
                user_id,
                travel_style,
                bus_comfort,
                travel_time,
                stay_type,
                amenities,
            ]
        );
        res.status(201).json({ success: true, preferences: result.rows[0] });
    } catch (error) {
        console.error("Error inserting preferences:", error);
        res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
});

module.exports = {
    router,
    preferencesTableExists,
};
