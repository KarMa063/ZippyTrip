const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function propertyTableExists() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS properties(
                id SERIAL PRIMARY KEY,
                name TEXT,
                description TEXT,
                address TEXT,
                email TEXT,
                contact TEXT,
                images JSONB,
                rooms INTEGER
            );`);
        console.log("Table created successfully");
    } catch (error) {
        console.error("Error creating table:", error);
    }
}

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
    const imageUrls = images.length > 0 ? images : ["/placeholder.png"];

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
                JSON.stringify(imageUrls),
                rooms,
            ]
        );
        res.status(201).json({ success: true, property: result.rows[0] });
    } catch (error) {
        console.error("Error inserting property: ", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

module.exports = {
  router,
  propertyTableExists
};
