const express = require('express');
const { check } = require('express-validator');
const { 
  createBusinessData, 
  getBusinessData, 
  getBusinessDataById, 
  getBusinessDataByType, 
  updateBusinessData, 
  deleteBusinessData 
} = require('../controllers/businessDataController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Create business data
router.post(
  '/',
  [
    check('dataName', 'Data name is required').not().isEmpty(),
    check('dataType', 'Data type is required').not().isEmpty(),
    check('dataContent', 'Data content is required').not().isEmpty()
  ],
  createBusinessData
);

// Get all business data for a user
router.get('/', getBusinessData);

// Get business data by ID
router.get('/:id', getBusinessDataById);

// Get business data by type
router.get('/type/:dataType', getBusinessDataByType);

// Update business data
router.put(
  '/:id',
  [
    check('dataName', 'Data name is required').not().isEmpty(),
    check('dataContent', 'Data content is required').not().isEmpty()
  ],
  updateBusinessData
);

// Delete business data
router.delete('/:id', deleteBusinessData);

module.exports = router; 