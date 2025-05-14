const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Create chat messages table
async function createChatMessagesTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS guesthouse_chat_messages (
        id SERIAL PRIMARY KEY,
        property_id INTEGER NOT NULL,
        traveller_id VARCHAR NOT NULL,
        owner_id VARCHAR NOT NULL,
        message TEXT NOT NULL,
        sender_type VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT FALSE
      );
    `);
    console.log("Guesthouse chat messages table created or already exists.");
  } catch (error) {
    console.error("Error creating guesthouse chat messages table:", error);
  }
}

// Send a message
router.post('/:propertyId/chat', async (req, res) => {
  const { propertyId } = req.params;
  const { traveller_id, owner_id, message, sender_type } = req.body;

  if (!traveller_id || !owner_id || !message || !sender_type) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing required fields" 
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO guesthouse_chat_messages 
        (property_id, traveller_id, owner_id, message, sender_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [propertyId, traveller_id, owner_id, message, sender_type]
    );

    res.status(201).json({ 
      success: true, 
      message: "Message sent successfully",
      chatMessage: result.rows[0]
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM guesthouse_chat_messages');
    res.status(200).json({ success: true, messages: result.rows });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get conversation history
router.get('/:propertyId/chat', async (req, res) => {
  const { propertyId } = req.params;
  const { travellerId, ownerId } = req.query;

  if (!travellerId || !ownerId) {
    return res.status(400).json({ 
      success: false, 
      message: "Both travellerId and ownerId are required" 
    });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM guesthouse_chat_messages 
       WHERE property_id = $1 AND traveller_id = $2 AND owner_id = $3
       ORDER BY created_at ASC`,
      [propertyId, travellerId, ownerId]
    );

    // Mark messages as read if they were sent to the requester
    const userType = req.query.userType;
    if (userType === 'owner' || userType === 'traveller') {
      const oppositeType = userType === 'owner' ? 'traveller' : 'owner';
      await pool.query(
        `UPDATE guesthouse_chat_messages 
         SET is_read = TRUE
         WHERE property_id = $1 AND traveller_id = $2 AND owner_id = $3 AND sender_type = $4`,
        [propertyId, travellerId, ownerId, oppositeType]
      );
    }

    res.status(200).json({
      success: true,
      messages: result.rows
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get unread message count
router.get('/unread-count', async (req, res) => {
  const { userId, userType } = req.query;

  if (!userId || !userType) {
    return res.status(400).json({ 
      success: false, 
      message: "Both userId and userType are required" 
    });
  }

  try {
    let query;
    let params;

    if (userType === 'owner') {
      query = `
        SELECT property_id, traveller_id, COUNT(*) as unread_count
        FROM guesthouse_chat_messages
        WHERE owner_id = $1 AND sender_type = 'traveller' AND is_read = FALSE
        GROUP BY property_id, traveller_id
      `;
      params = [userId];
    } else {
      query = `
        SELECT property_id, owner_id, COUNT(*) as unread_count
        FROM guesthouse_chat_messages
        WHERE traveller_id = $1 AND sender_type = 'owner' AND is_read = FALSE
        GROUP BY property_id, owner_id
      `;
      params = [userId];
    }

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      unreadCounts: result.rows
    });
  } catch (error) {
    console.error("Error fetching unread counts:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = { router, createChatMessagesTable };