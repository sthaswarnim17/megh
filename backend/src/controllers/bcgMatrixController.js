const { validationResult } = require('express-validator');
const BCGMatrix = require('../models/bcgMatrixModel');
const AnalysisResult = require('../models/analysisModel');

/**
 * @desc    Create new BCG matrix item
 * @route   POST /api/bcg-matrix
 * @access  Private
 */
const createBCGMatrixItem = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { analysisId, itemName, category, marketGrowth, marketShare, explanation } = req.body;

    // Check if analysis exists and belongs to the user
    const analysis = await AnalysisResult.getById(analysisId, req.user.id);
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    // Create BCG matrix item
    const bcgMatrixItem = await BCGMatrix.create(
      analysisId,
      itemName,
      category,
      marketGrowth,
      marketShare,
      explanation
    );

    res.status(201).json(bcgMatrixItem);
  } catch (error) {
    console.error('Error creating BCG matrix item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get all BCG matrix items for an analysis
 * @route   GET /api/bcg-matrix/analysis/:analysisId
 * @access  Private
 */
const getBCGMatrixByAnalysisId = async (req, res) => {
  try {
    // Check if analysis exists and belongs to the user
    const analysis = await AnalysisResult.getById(req.params.analysisId, req.user.id);
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    const bcgMatrixItems = await BCGMatrix.getByAnalysisId(req.params.analysisId);
    res.json(bcgMatrixItems);
  } catch (error) {
    console.error('Error getting BCG matrix items:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get BCG matrix item by ID
 * @route   GET /api/bcg-matrix/:id
 * @access  Private
 */
const getBCGMatrixItemById = async (req, res) => {
  try {
    const bcgMatrixItem = await BCGMatrix.getById(req.params.id);
    
    if (bcgMatrixItem) {
      // Check if the associated analysis belongs to the user
      const analysis = await AnalysisResult.getById(bcgMatrixItem.analysis_id, req.user.id);
      if (!analysis) {
        return res.status(403).json({ message: 'Not authorized to access this BCG matrix item' });
      }
      
      res.json(bcgMatrixItem);
    } else {
      res.status(404).json({ message: 'BCG matrix item not found' });
    }
  } catch (error) {
    console.error('Error getting BCG matrix item by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get BCG matrix items by category
 * @route   GET /api/bcg-matrix/analysis/:analysisId/category/:category
 * @access  Private
 */
const getBCGMatrixByCategory = async (req, res) => {
  try {
    // Check if analysis exists and belongs to the user
    const analysis = await AnalysisResult.getById(req.params.analysisId, req.user.id);
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    const bcgMatrixItems = await BCGMatrix.getByCategory(req.params.analysisId, req.params.category);
    res.json(bcgMatrixItems);
  } catch (error) {
    console.error('Error getting BCG matrix items by category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update BCG matrix item
 * @route   PUT /api/bcg-matrix/:id
 * @access  Private
 */
const updateBCGMatrixItem = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemName, category, marketGrowth, marketShare, explanation } = req.body;

    // Check if BCG matrix item exists
    const bcgMatrixItem = await BCGMatrix.getById(req.params.id);
    if (!bcgMatrixItem) {
      return res.status(404).json({ message: 'BCG matrix item not found' });
    }

    // Check if the associated analysis belongs to the user
    const analysis = await AnalysisResult.getById(bcgMatrixItem.analysis_id, req.user.id);
    if (!analysis) {
      return res.status(403).json({ message: 'Not authorized to update this BCG matrix item' });
    }

    // Update BCG matrix item
    const updatedBCGMatrixItem = await BCGMatrix.update(
      req.params.id,
      itemName,
      category,
      marketGrowth,
      marketShare,
      explanation
    );

    res.json(updatedBCGMatrixItem);
  } catch (error) {
    console.error('Error updating BCG matrix item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Delete BCG matrix item
 * @route   DELETE /api/bcg-matrix/:id
 * @access  Private
 */
const deleteBCGMatrixItem = async (req, res) => {
  try {
    // Check if BCG matrix item exists
    const bcgMatrixItem = await BCGMatrix.getById(req.params.id);
    if (!bcgMatrixItem) {
      return res.status(404).json({ message: 'BCG matrix item not found' });
    }

    // Check if the associated analysis belongs to the user
    const analysis = await AnalysisResult.getById(bcgMatrixItem.analysis_id, req.user.id);
    if (!analysis) {
      return res.status(403).json({ message: 'Not authorized to delete this BCG matrix item' });
    }

    // Delete BCG matrix item
    await BCGMatrix.delete(req.params.id);

    res.json({ message: 'BCG matrix item deleted' });
  } catch (error) {
    console.error('Error deleting BCG matrix item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get BCG matrix summary for a user
 * @route   GET /api/bcg-matrix/summary
 * @access  Private
 */
const getBCGMatrixSummary = async (req, res) => {
  try {
    const summary = await BCGMatrix.getSummaryByUserId(req.user.id);
    res.json(summary);
  } catch (error) {
    console.error('Error getting BCG matrix summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createBCGMatrixItem,
  getBCGMatrixByAnalysisId,
  getBCGMatrixItemById,
  getBCGMatrixByCategory,
  updateBCGMatrixItem,
  deleteBCGMatrixItem,
  getBCGMatrixSummary,
}; 