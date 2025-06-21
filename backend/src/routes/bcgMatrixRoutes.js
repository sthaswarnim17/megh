const express = require('express');
const { check } = require('express-validator');
const { 
  createBCGMatrixItem, 
  getBCGMatrixByAnalysisId, 
  getBCGMatrixItemById, 
  getBCGMatrixByCategory, 
  updateBCGMatrixItem, 
  deleteBCGMatrixItem, 
  getBCGMatrixSummary 
} = require('../controllers/bcgMatrixController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Create BCG matrix item
router.post(
  '/',
  [
    check('analysisId', 'Analysis ID is required').not().isEmpty(),
    check('itemName', 'Item name is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty(),
    check('marketGrowth', 'Market growth is required').not().isEmpty(),
    check('marketShare', 'Market share is required').not().isEmpty()
  ],
  createBCGMatrixItem
);

// Get all BCG matrix items for an analysis
router.get('/analysis/:analysisId', getBCGMatrixByAnalysisId);

// Get BCG matrix item by ID
router.get('/:id', getBCGMatrixItemById);

// Get BCG matrix items by category
router.get('/analysis/:analysisId/category/:category', getBCGMatrixByCategory);

// Get BCG matrix summary for a user
router.get('/summary', getBCGMatrixSummary);

// Update BCG matrix item
router.put(
  '/:id',
  [
    check('itemName', 'Item name is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty(),
    check('marketGrowth', 'Market growth is required').not().isEmpty(),
    check('marketShare', 'Market share is required').not().isEmpty()
  ],
  updateBCGMatrixItem
);

// Delete BCG matrix item
router.delete('/:id', deleteBCGMatrixItem);

module.exports = router; 