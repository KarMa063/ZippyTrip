const attractionsModel = require('../models/attractions');

// Get all attractions
const getAllAttractions = async (req, res) => {
  try {
    const attractions = await attractionsModel.getAllAttractions();
    res.json(attractions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get attraction by ID
const getAttractionById = async (req, res) => {
  try {
    const attraction = await attractionsModel.getAttractionById(req.params.id);
    if (!attraction) {
      return res.status(404).json({ message: 'Attraction not found' });
    }
    res.json(attraction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new attraction
const createAttraction = async (req, res) => {
  try {
    const newAttraction = await attractionsModel.createAttraction(req.body);
    res.status(201).json(newAttraction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update attraction
const updateAttraction = async (req, res) => {
  try {
    const updatedAttraction = await attractionsModel.updateAttraction(
      req.params.id,
      req.body
    );
    if (!updatedAttraction) {
      return res.status(404).json({ message: 'Attraction not found' });
    }
    res.json(updatedAttraction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete attraction
const deleteAttraction = async (req, res) => {
  try {
    const result = await attractionsModel.deleteAttraction(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllAttractions,
  getAttractionById,
  createAttraction,
  updateAttraction,
  deleteAttraction
};