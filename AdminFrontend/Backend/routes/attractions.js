const express = require('express');
const router = express.Router();
const attractionsController = require('../controllers/attractionsController');

// GET all attractions
router.get('/', attractionsController.getAllAttractions);

// GET attraction by ID
router.get('/:id', attractionsController.getAttractionById);

// POST new attraction
router.post('/', attractionsController.createAttraction);

// PUT update attraction
router.put('/:id', attractionsController.updateAttraction);

// DELETE attraction
router.delete('/:id', attractionsController.deleteAttraction);

module.exports = router;