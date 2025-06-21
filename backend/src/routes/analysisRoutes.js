const express = require('express');
const { check } = require('express-validator');
const { 
  createAnalysis, 
  getAnalysisResults, 
  getAnalysisById, 
  getAnalysisByType, 
  getAnalysisByDataId, 
  updateAnalysis, 
  deleteAnalysis,
  generateMarketingStrategies,
  generateProductPrototype,
  analyzeMarketResearch
} = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Create analysis result
router.post(
  '/',
  [
    check('dataId', 'Data ID is required').not().isEmpty(),
    check('analysisType', 'Analysis type is required').not().isEmpty(),
    check('analysisContent', 'Analysis content is required').not().isEmpty()
  ],
  createAnalysis
);

// Get all analysis results for a user
router.get('/', getAnalysisResults);

// Get analysis result by ID
router.get('/:id', getAnalysisById);

// Get analysis results by type
router.get('/type/:analysisType', getAnalysisByType);

// Get analysis results by data ID
router.get('/data/:dataId', getAnalysisByDataId);

// Update analysis result
router.put(
  '/:id',
  [
    check('analysisContent', 'Analysis content is required').not().isEmpty()
  ],
  updateAnalysis
);

// Delete analysis result
router.delete('/:id', deleteAnalysis);

// Generate marketing strategies
router.post('/strategies', generateMarketingStrategies);

// Generate product prototype
router.post('/prototype', generateProductPrototype);

// Analyze market research data
router.post('/market_research', analyzeMarketResearch);

module.exports = router;