const express = require('express');
const router = express.Router();
const attractionsModel = require('../models/attractions');

// Get all attractions
router.get('/', async (req, res) => {
  try {
    const attractions = await attractionsModel.getAllAttractions();
    res.json({ success: true, attractions });
  } catch (error) {
    console.error('Error fetching attractions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attractions' });
  }
});

// Get attraction by ID
router.get('/:id', async (req, res) => {
  try {
    const attraction = await attractionsModel.getAttractionById(req.params.id);
    if (!attraction) {
      return res.status(404).json({ success: false, message: 'Attraction not found' });
    }
    res.json({ success: true, attraction });
  } catch (error) {
    console.error('Error fetching attraction:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attraction' });
  }
});

// Create new attraction
router.post('/', async (req, res) => {
  try {
    console.log('Received attraction data:', req.body);
    const newAttraction = await attractionsModel.createAttraction(req.body);
    res.status(201).json({ success: true, attraction: newAttraction });
  } catch (error) {
    console.error('Error creating attraction:', error);
    res.status(500).json({ success: false, message: 'Failed to create attraction' });
  }
});

// Update attraction
router.put('/:id', async (req, res) => {
  try {
    const updatedAttraction = await attractionsModel.updateAttraction(req.params.id, req.body);
    if (!updatedAttraction) {
      return res.status(404).json({ success: false, message: 'Attraction not found' });
    }
    res.json({ success: true, attraction: updatedAttraction });
  } catch (error) {
    console.error('Error updating attraction:', error);
    res.status(500).json({ success: false, message: 'Failed to update attraction' });
  }
});

// Delete attraction
router.delete('/:id', async (req, res) => {
  try {
    await attractionsModel.deleteAttraction(req.params.id);
    res.json({ success: true, message: 'Attraction deleted successfully' });
  } catch (error) {
    console.error('Error deleting attraction:', error);
    res.status(500).json({ success: false, message: 'Failed to delete attraction' });
  }
});

module.exports = router;