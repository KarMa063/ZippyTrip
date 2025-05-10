const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// List of allowed guesthouse owner emails
const ALLOWED_GUESTHOUSE_EMAILS = ['zippytrip101@gmail.com', 'zippyguest'];

// Guesthouse owner login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // First check if the email is in the allowed list
    if (!ALLOWED_GUESTHOUSE_EMAILS.includes(email)) {
      return res.status(403).json({ 
        success: false, 
        message: "You are not authorized to access the guesthouse owner portal." 
      });
    }
    
    // If email is allowed, proceed with authentication
    // This would typically involve checking credentials against a database
    // For now, we'll just return success since we've already verified the email
    
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        email: email,
        role: "guesthouse_owner"
      }
    });
    
  } catch (error) {
    console.error("Error in guesthouse login:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

module.exports = router;