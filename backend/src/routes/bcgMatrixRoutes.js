const express = require('express');
const { 
  analyzeBCGMatrix, 
  createBCGMatrixItem, 
  getBCGMatrixByAnalysisId, 
  getBCGMatrixItemById, 
  getBCGMatrixByCategory, 
  updateBCGMatrixItem, 
  deleteBCGMatrixItem, 
  getBCGMatrixSummary 
} = require('../controllers/bcgMatrixController');
const router = express.Router();

/**
 * @route POST /api/bcg-matrix/demo
 * @desc Demo endpoint to test BCG matrix analysis with sample.csv
 * @access Public
 */
router.post('/demo', async (req, res) => {
  try {
    const path = require('path');
    const fs = require('fs');
    
    // Check if sample.csv exists
    const sampleFilePath = path.join(__dirname, '../../../sample.csv');
    if (!fs.existsSync(sampleFilePath)) {
      return res.status(404).json({ 
        success: false,
        message: 'Sample data file not found' 
      });
    }
    
    console.log("Demo endpoint called. Using sample file:", sampleFilePath);
    
    // Log the Gemini API key status (without exposing the key)
    const apiKeyPresent = process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY !== 'YOUR_API_KEY_HERE';
    console.log("Google API Key status:", apiKeyPresent ? "API key is set" : "NO API KEY FOUND - will fail");
    
    // Use the analyzeBCGMatrix function with the sample file
    analyzeBCGMatrix({
      body: {
        filePath: sampleFilePath,
        dataName: "Demo Dataset"
      }
    }, res);
  } catch (error) {
    console.error("Error in demo endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Error processing demo request",
      error: error.message
    });
  }
});

// Public routes that don't require authentication
/**
 * @route POST /api/bcg-matrix/analyze
 * @desc Analyze data using BCG matrix and Python script
 * @access Public
 */
router.post('/analyze', analyzeBCGMatrix);

// Private routes below would typically use authentication middleware
// We're removing it for demo purposes
/**
 * @route POST /api/bcg-matrix
 * @desc Create new BCG matrix item
 * @access Public (for demo)
 */
router.post('/', createBCGMatrixItem);

/**
 * @route GET /api/bcg-matrix/analysis/:analysisId
 * @desc Get BCG matrix items by analysis ID
 * @access Public (for demo)
 */
router.get('/analysis/:analysisId', getBCGMatrixByAnalysisId);

/**
 * @route GET /api/bcg-matrix/:id
 * @desc Get BCG matrix item by ID
 * @access Public (for demo)
 */
router.get('/:id', getBCGMatrixItemById);

/**
 * @route GET /api/bcg-matrix/analysis/:analysisId/category/:category
 * @desc Get BCG matrix items by category
 * @access Public (for demo)
 */
router.get('/analysis/:analysisId/category/:category', getBCGMatrixByCategory);

/**
 * @route PUT /api/bcg-matrix/:id
 * @desc Update BCG matrix item
 * @access Public (for demo)
 */
router.put('/:id', updateBCGMatrixItem);

/**
 * @route DELETE /api/bcg-matrix/:id
 * @desc Delete BCG matrix item
 * @access Public (for demo)
 */
router.delete('/:id', deleteBCGMatrixItem);

/**
 * @route GET /api/bcg-matrix/summary
 * @desc Get BCG matrix summary
 * @access Public (for demo)
 */
router.get('/summary', getBCGMatrixSummary);

module.exports = router; 