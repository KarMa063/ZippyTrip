const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Create Reviews Table if it doesn't exist
async function createReviewsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS guesthouse_reviews (
        id SERIAL PRIMARY KEY,
        property_id INTEGER NOT NULL,
        user_id VARCHAR NOT NULL,
        email VARCHAR NOT NULL,
        rating NUMERIC NOT NULL,
        review TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Guesthouse reviews table created or already exists.");
  } catch (error) {
    console.error("Error creating guesthouse reviews table:", error);
  }
}

// POST route to create a review
router.post('/:propertyId/reviews', async (req, res) => {
  const { propertyId } = req.params;
  const { user_id, email, rating, review } = req.body;

  try {
    const propertyCheck = await pool.query(
      'SELECT id FROM properties WHERE id = $1',
      [propertyId]
    );

    if (propertyCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    const result = await pool.query(
      `INSERT INTO guesthouse_reviews 
        (property_id, user_id, email, rating, review)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [propertyId, user_id, email, rating, review]
    );

    res.status(201).json({ success: true, review: result.rows[0] });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET route to retrieve all reviews for a specific property
router.get('/:propertyId/reviews', async (req, res) => {
  const { propertyId } = req.params;

  try {
    const reviewsResult = await pool.query(
      'SELECT * FROM guesthouse_reviews WHERE property_id = $1 ORDER BY createdAt DESC',
      [propertyId]
    );

    const formattedReviews = reviewsResult.rows.map(review => ({
      id: review.id,
      userName: review.email.split('@')[0] || 'Anonymous',
      rating: review.rating,
      comment: review.review,
      date: review.createdAt,
      email: review.email
    }));

    res.status(200).json({
      success: true,
      reviews: formattedReviews
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = {
  router,
  createReviewsTable
};