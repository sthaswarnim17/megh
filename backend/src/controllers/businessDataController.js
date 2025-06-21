const { validationResult } = require('express-validator');
const BusinessData = require('../models/businessDataModel');

/**
 * @desc    Create new business data
 * @route   POST /api/business-data
 * @access  Private
 */
const createBusinessData = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { dataName, dataType, dataContent } = req.body;
    
    // Validate required fields
    if (!dataName || !dataType || !dataContent) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: {
          dataName: dataName ? 'Valid' : 'Missing',
          dataType: dataType ? 'Valid' : 'Missing',
          dataContent: dataContent ? 'Valid' : 'Missing'
        }
      });
    }
    
    // Validate dataContent is valid JSON if it's a string
    let parsedContent;
    if (typeof dataContent === 'string') {
      try {
        parsedContent = JSON.parse(dataContent);
      } catch (jsonError) {
        return res.status(400).json({ 
          message: 'Invalid JSON in dataContent field',
          error: jsonError.message
        });
      }
    } else {
      parsedContent = dataContent;
    }
    
    // Check if this is a batch upload
    if (dataType === 'customer_data_batch' && parsedContent.metadata && parsedContent.metadata.batchNumber) {
      return handleBatchUpload(req, res, parsedContent, dataName, dataType);
    }

    // Create business data
    const businessData = await BusinessData.create(
      req.user.id,
      dataName,
      dataType,
      dataContent
    );

    res.status(201).json(businessData);
  } catch (error) {
    console.error('Error creating business data:', error);
    res.status(500).json({ 
      message: 'Server error while creating business data',
      error: error.message,
      details: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

/**
 * @desc    Handle batched data uploads
 * @access  Private (internal function)
 */
const handleBatchUpload = async (req, res, parsedContent, dataName, dataType) => {
  try {
    const { batchNumber, totalBatches } = parsedContent.metadata;
    
    console.log(`Processing batch ${batchNumber} of ${totalBatches}`);
    
    // Store the batch with a special type to indicate it's part of a batch
    const batchData = await BusinessData.create(
      req.user.id,
      dataName,
      dataType,
      typeof parsedContent === 'string' ? parsedContent : JSON.stringify(parsedContent)
    );
    
    // Return success for this batch
    res.status(201).json({
      ...batchData,
      batchStatus: {
        batchNumber,
        totalBatches,
        status: 'success'
      }
    });
    
  } catch (error) {
    console.error('Error handling batch upload:', error);
    res.status(500).json({ 
      message: 'Server error while processing batch upload',
      error: error.message,
      batchStatus: {
        status: 'failed'
      }
    });
  }
};

/**
 * @desc    Get all business data for a user
 * @route   GET /api/business-data
 * @access  Private
 */
const getBusinessData = async (req, res) => {
  try {
    const businessData = await BusinessData.getByUserId(req.user.id);
    res.json(businessData);
  } catch (error) {
    console.error('Error getting business data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get business data by ID
 * @route   GET /api/business-data/:id
 * @access  Private
 */
const getBusinessDataById = async (req, res) => {
  try {
    const businessData = await BusinessData.getById(req.params.id, req.user.id);
    
    if (businessData) {
      res.json(businessData);
    } else {
      res.status(404).json({ message: 'Business data not found' });
    }
  } catch (error) {
    console.error('Error getting business data by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get business data by type
 * @route   GET /api/business-data/type/:dataType
 * @access  Private
 */
const getBusinessDataByType = async (req, res) => {
  try {
    const businessData = await BusinessData.getByType(req.user.id, req.params.dataType);
    res.json(businessData);
  } catch (error) {
    console.error('Error getting business data by type:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update business data
 * @route   PUT /api/business-data/:id
 * @access  Private
 */
const updateBusinessData = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { dataName, dataContent } = req.body;

    // Check if business data exists
    const businessDataExists = await BusinessData.getById(req.params.id, req.user.id);
    if (!businessDataExists) {
      return res.status(404).json({ message: 'Business data not found' });
    }

    // Update business data
    const updatedBusinessData = await BusinessData.update(
      req.params.id,
      req.user.id,
      dataName,
      dataContent
    );

    res.json(updatedBusinessData);
  } catch (error) {
    console.error('Error updating business data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Delete business data
 * @route   DELETE /api/business-data/:id
 * @access  Private
 */
const deleteBusinessData = async (req, res) => {
  try {
    // Check if business data exists
    const businessDataExists = await BusinessData.getById(req.params.id, req.user.id);
    if (!businessDataExists) {
      return res.status(404).json({ message: 'Business data not found' });
    }

    // Delete business data
    await BusinessData.delete(req.params.id, req.user.id);

    res.json({ message: 'Business data deleted' });
  } catch (error) {
    console.error('Error deleting business data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createBusinessData,
  getBusinessData,
  getBusinessDataById,
  getBusinessDataByType,
  updateBusinessData,
  deleteBusinessData,
}; 