const { validationResult } = require('express-validator');
const BCGMatrix = require('../models/bcgMatrixModel');
const AnalysisResult = require('../models/analysisModel');
const BusinessData = require('../models/businessDataModel');
const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const { processBCGMatrix } = require('../../process_bcg');

// Gemini API is initialized in index.js and made available globally

/**
 * @desc    Create new BCG matrix item
 * @route   POST /api/bcg-matrix
 * @access  Public (for demo)
 */
const createBCGMatrixItem = async (req, res) => {
  try {
    const { analysisId, itemName, category, marketGrowth, marketShare, explanation } = req.body;

    // In demo mode, skip user validation
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
 * @desc    Analyze CSV data and generate BCG matrix
 * @route   POST /api/bcg-matrix/analyze
 * @access  Public
 */
const analyzeBCGMatrix = async (req, res) => {
  try {
    const { filePath, dataName, csvContent } = req.body;

    console.log(`Processing BCG Matrix analysis for ${dataName || 'unknown dataset'}`);
    
    let fileToProcess = '';
    let isTemporaryFile = false;
    
    if (csvContent) {
      // If CSV content is provided directly, create a temporary file
      console.log("CSV content provided directly. Length:", csvContent.length);
      console.log("First 100 chars of CSV:", csvContent.substring(0, 100));
      
      const fs = require('fs');
      const path = require('path');
      const tempDir = path.join(__dirname, '../../../temp');
      
      // Ensure temp directory exists
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Create unique filename
      const tempFile = path.join(tempDir, `upload_${Date.now()}.csv`);
      console.log(`Writing CSV content to temp file: ${tempFile}`);
      
      // Validate CSV content before writing to file
      if (!csvContent || typeof csvContent !== 'string' || csvContent.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid CSV content provided'
        });
      }
      
      // Check for CSV header
      const firstLine = csvContent.split('\n')[0];
      if (!firstLine || firstLine.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'CSV content appears to be empty or invalid'
        });
      }
      
      try {
        fs.writeFileSync(tempFile, csvContent, 'utf8');
        fileToProcess = tempFile;
        isTemporaryFile = true;
        
        // Verify file was written correctly
        if (fs.existsSync(tempFile)) {
          const stats = fs.statSync(tempFile);
          console.log(`Temporary file created successfully. Size: ${stats.size} bytes`);
          
          // Debug: Read back first few lines to verify content
          const content = fs.readFileSync(tempFile, 'utf8').substring(0, 200);
          console.log("File content verification:", content);
        } else {
          console.error("Failed to create temporary file!");
          return res.status(500).json({
            success: false,
            message: 'Failed to create temporary file for processing'
          });
        }
      } catch (fsError) {
        console.error("Error writing temporary file:", fsError);
        return res.status(500).json({
          success: false,
          message: 'Error creating temporary file: ' + fsError.message
        });
      }
    } else if (filePath) {
      // If file path is provided, use it directly
      console.log(`Using provided file path: ${filePath}`);
      fileToProcess = filePath;
      
      // Check if the file exists
      const fs = require('fs');
      if (!fs.existsSync(fileToProcess)) {
        return res.status(404).json({ 
          success: false, 
          message: `File not found: ${fileToProcess}` 
        });
      }
      
      // Debug: Read some content from the file
      const content = fs.readFileSync(fileToProcess, 'utf8').substring(0, 200);
      console.log("File content preview:", content);
    } else {
      // If neither is provided, return an error
      return res.status(400).json({ 
        success: false, 
        message: 'Either filePath or csvContent is required' 
      });
    }

    // Process the BCG matrix using Python through the wrapper
    try {
      console.log(`Starting BCG analysis on file: ${fileToProcess}`);
      const outputDir = path.join(__dirname, '../../../temp/output');
      
      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const result = await processBCGMatrix(fileToProcess, outputDir);
      
      // Generate AI analysis using Gemini
      console.log("BCG matrix processing complete. Generating AI analysis...");
      const analysis = await generateGeminiAnalysis(
        result.imageBase64, 
        result.summaryData, 
        dataName || 'Dataset'
      );

      // Clean up temporary file if created
      if (isTemporaryFile && fs.existsSync(fileToProcess)) {
        console.log(`Cleaning up temporary file: ${fileToProcess}`);
        try {
          fs.unlinkSync(fileToProcess);
          console.log("Temporary file deleted successfully");
        } catch (cleanupError) {
          console.error("Error cleaning up temporary file:", cleanupError);
        }
      }

      // Return the results
      console.log("Sending analysis results to client");
      return res.json({
        success: true,
        data: {
          id: `bcg_${Date.now()}`,
          data_name: dataName || 'Unnamed Dataset',
          image: result.imageBase64,
          summary: result.summaryData,
          analysis,
          created_at: new Date().toISOString(),
        }
      });

    } catch (error) {
      console.error('Error processing BCG matrix:', error);
      
      // Clean up temporary file if there was an error
      if (isTemporaryFile) {
        const fs = require('fs');
        if (fs.existsSync(fileToProcess)) {
          try {
            fs.unlinkSync(fileToProcess);
            console.log("Temporary file deleted after error");
          } catch (cleanupError) {
            console.error("Error cleaning up temporary file after processing error:", cleanupError);
          }
        }
      }
      
      // Provide more detailed error message based on error type
      let errorMessage = 'Error processing BCG matrix';
      if (error.message.includes('Python script failed')) {
        if (error.message.includes('Error tokenizing data') || error.message.includes('EOF inside string')) {
          errorMessage = 'CSV parsing error: The file contains improperly formatted data. Please check for unclosed quotes or special characters.';
        } else if (error.message.includes('could not convert string to float')) {
          errorMessage = 'Data format error: Some numeric values in your CSV are not properly formatted. Please check your data.';
        } else {
          errorMessage = 'Python processing error: ' + error.message;
        }
      }
      
      return res.status(500).json({ 
        success: false, 
        message: errorMessage, 
        error: error.message 
      });
    }
  } catch (error) {
    console.error('Error in BCG matrix analysis:', error);
    return res.status(500).json({
      success: false,
      message: 'Error analyzing BCG matrix',
      error: error.message
    });
  }
};

/**
 * @desc    Generate analysis from Gemini AI
 * @access  Private (internal function)
 */
const generateGeminiAnalysis = async (imageBase64, summary, dataName) => {
  try {
    console.log("Starting Gemini analysis generation...");
    
    // Check if API is available - if not, use a fallback static analysis
    let useStaticAnalysis = false;
    
    if (!global.genAI) {
      console.error("genAI is not defined in global scope. Using static analysis.");
      useStaticAnalysis = true;
    }
    
    // Format the top products information for the prompt
    let topProductsText = '';
    if (summary.top_products && summary.top_products.length > 0) {
      topProductsText = 'Top Products by Quantity:\n';
      summary.top_products.forEach((product, index) => {
        topProductsText += `${index + 1}. ${product.name} (${product.quantity} units) - ${product.category} category\n`;
      });
    }
    
    // Use static analysis if API not available or for demo purposes
    if (useStaticAnalysis || !process.env.GOOGLE_API_KEY) {
      console.log("Using static analysis instead of API");
      
      // Create a tailored analysis based on the summary data
      let starCount = summary.counts.star || 0;
      let cashCowCount = summary.counts.cash_cow || 0;
      let questionMarkCount = summary.counts.question_mark || 0;
      let dogCount = summary.counts.dog || 0;
      
      // Get top products in each category
      const topProductsByCat = {
        star: [],
        cash_cow: [],
        question_mark: [],
        dog: []
      };
      
      if (summary.top_products) {
        summary.top_products.forEach(product => {
          const category = product.category.toLowerCase().replace(' ', '_');
          if (topProductsByCat[category]) {
            topProductsByCat[category].push(product.name);
          }
        });
      }
      
      // Generate a sample analysis using the actual data from the matrix
      return `# Portfolio Balance Analysis

Your BCG Matrix analysis reveals a portfolio with ${starCount} Stars, ${cashCowCount} Cash Cows, ${questionMarkCount} Question Marks, and ${dogCount} Dogs. This distribution suggests ${starCount > cashCowCount ? "a growth-oriented portfolio with strong future potential" : "a mature portfolio with strong cash generation capabilities"}.

## Most Purchased Products Analysis

Based on quantity data, your top-selling products fall primarily in the ${summary.top_products?.[0]?.category || "Star"} category. This indicates customers are most interested in ${summary.top_products?.[0]?.category === "Star" ? "high-growth, market-leading products" : summary.top_products?.[0]?.category === "Cash Cow" ? "established, stable products" : summary.top_products?.[0]?.category === "Question Mark" ? "emerging products with growth potential" : "products that may need reconsideration"}.

${topProductsByCat.star.length > 0 ? `Your star products like ${topProductsByCat.star.slice(0, 2).join(", ")} demonstrate strong market position and growth potential.` : ""}
${topProductsByCat.cash_cow.length > 0 ? `Cash cow products such as ${topProductsByCat.cash_cow.slice(0, 2).join(", ")} provide reliable revenue streams.` : ""}

## Strategic Recommendations

### Stars (${starCount})
${starCount > 0 ? "- Continue investing in your Star products to maintain their market position" : "- Consider developing new Star products through innovation or acquisition"}
- Allocate significant marketing resources to support future growth
- Monitor market share closely to maintain competitive advantage

### Cash Cows (${cashCowCount})
${cashCowCount > 0 ? "- Maximize profitability from these established products" : "- Develop strategies to move question marks into this quadrant"}
- Use generated cash to fund Stars and select Question Marks
- Implement efficiency measures to increase margins

### Question Marks (${questionMarkCount})
${questionMarkCount > 0 ? "- Carefully evaluate each product's potential for growth" : "- Look for emerging market opportunities to develop new Question Marks"}
- Invest selectively in those with clear path to Star status
- Consider divesting those unlikely to succeed

### Dogs (${dogCount})
${dogCount > 0 ? "- Consider phasing out underperforming products" : "- Maintain your disciplined approach to avoiding low-potential products"}
- Extract remaining value or reposition if possible
- Redirect resources to more promising areas

## Resource Allocation Priorities

Based on purchase patterns, prioritize investment in your top-selling ${summary.top_products?.[0]?.category || "products"} to maximize returns.

1. Allocate 50% of resources to Star products for growth
2. Maintain 30% for Cash Cows to ensure steady revenue
3. Invest 15% in promising Question Marks
4. Limit 5% to Dogs for strategic repositioning

## Key Risks & Opportunities

### Risks:
- Market saturation in Cash Cow segment could reduce margins
- Overinvestment in Question Marks without clear strategy
- Competitive threats to Star products

### Opportunities:
- Cross-selling between popular products in different quadrants
- Developing complementary products to Stars
- Leveraging customer data from high-quantity products for innovation`;
    }
    
    // If API available, proceed with Gemini call
    console.log("Creating Gemini model instance with gemini-1.5-flash...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    if (!model) {
      console.error("Failed to create Gemini model instance!");
      return "Error: Failed to create Gemini model instance.";
    }

    // Remove the data:image/png;base64, prefix if present
    const imageData = imageBase64.replace(/^data:image\/png;base64,/, '');
    
    // Convert base64 to parts format Gemini API expects
    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: "image/png"
      }
    };
    
    // Create a prompt with the image
    const prompt = `
This is a BCG (Boston Consulting Group) Matrix analysis for the dataset "${dataName}".

The analysis shows:
- Market Share Threshold: ${summary.thresholds.market_share.toFixed(2)}
- Growth Rate Threshold: ${summary.thresholds.growth_rate.toFixed(2)}
- Stars: ${summary.counts.star} products
- Cash Cows: ${summary.counts.cash_cow} products
- Question Marks: ${summary.counts.question_mark} products
- Dogs: ${summary.counts.dog} products
- Total Products: ${summary.counts.total}

${topProductsText}

Based on the BCG Matrix image shown and the top products by quantity data, please provide:
1. A strategic analysis of the overall portfolio balance
2. Detailed insights on the most purchased products and their strategic importance
3. Specific recommendations for each quadrant (Stars, Cash Cows, Question Marks, Dogs)
4. Resource allocation advice prioritizing the most popular/purchased products
5. Key risks and opportunities based on the purchase patterns

Make your analysis actionable, insightful and business-oriented (around 350-450 words).
`;

    console.log("Sending request to Gemini API...");
    
    // Generate content
    try {
      const result = await model.generateContent([prompt, imagePart]);
      console.log("Received response from Gemini API");
      
      if (!result || !result.response) {
        console.error("Gemini API returned empty response");
        return "Error: Gemini API returned empty response.";
      }
      
      const text = result.response.text();
      console.log("Analysis text length:", text.length);
      
      if (!text || text.length === 0) {
        console.error("Generated text is empty");
        return "Error: Generated text is empty. Please try again.";
      }
      
      return text;
    } catch (apiError) {
      console.error("Error in Gemini API call:", apiError);
      return `Error generating AI analysis via Gemini API: ${apiError.message}. Please ensure your API key is valid and has access to Gemini 1.5 Flash.`;
    }
  } catch (error) {
    console.error('Error in generateGeminiAnalysis function:', error);
    return `Error generating AI analysis: ${error.message}. Please try again later.`;
  }
};

/**
 * @desc    Get BCG matrix items by analysis ID
 * @route   GET /api/bcg-matrix/analysis/:analysisId
 * @access  Public (for demo)
 */
const getBCGMatrixByAnalysisId = async (req, res) => {
  try {
    // Demo mode - skip auth check
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
 * @access  Public (for demo)
 */
const getBCGMatrixItemById = async (req, res) => {
  try {
    const bcgMatrixItem = await BCGMatrix.getById(req.params.id);
    
    if (bcgMatrixItem) {
      // Demo mode - skip auth check
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
 * @access  Public (for demo)
 */
const getBCGMatrixByCategory = async (req, res) => {
  try {
    // Demo mode - skip auth check
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
 * @access  Public (for demo)
 */
const updateBCGMatrixItem = async (req, res) => {
  try {
    const { itemName, category, marketGrowth, marketShare, explanation } = req.body;

    // Check if BCG matrix item exists
    const bcgMatrixItem = await BCGMatrix.getById(req.params.id);
    if (!bcgMatrixItem) {
      return res.status(404).json({ message: 'BCG matrix item not found' });
    }

    // Demo mode - skip auth check

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
 * @access  Public (for demo)
 */
const deleteBCGMatrixItem = async (req, res) => {
  try {
    // Check if BCG matrix item exists
    const bcgMatrixItem = await BCGMatrix.getById(req.params.id);
    if (!bcgMatrixItem) {
      return res.status(404).json({ message: 'BCG matrix item not found' });
    }

    // Demo mode - skip auth check

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
 * @access  Public (for demo)
 */
const getBCGMatrixSummary = async (req, res) => {
  try {
    // Demo mode - use a default user ID
    const demoUserId = 1;
    const summary = await BCGMatrix.getSummaryByUserId(demoUserId);
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
  analyzeBCGMatrix
}; 