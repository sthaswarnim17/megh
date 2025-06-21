/**
 * Script to analyze Nepali market data with Gemini AI
 * 
 * Usage: 
 * 1. Set your Gemini API key as an environment variable:
 *    - On Windows: set GEMINI_API_KEY=your_api_key_here
 *    - On Linux/Mac: export GEMINI_API_KEY=your_api_key_here
 * 
 * 2. Run the script:
 *    node analyze-nepali-market.js
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Check if API key is provided
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Error: GEMINI_API_KEY environment variable is not set.');
  console.log('Please set your Gemini API key as an environment variable:');
  console.log('- On Windows: set GEMINI_API_KEY=your_api_key_here');
  console.log('- On Linux/Mac: export GEMINI_API_KEY=your_api_key_here');
  process.exit(1);
}

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Configure generation parameters
const generationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,
};

/**
 * Generate content using Gemini AI
 * @param {string} prompt - The prompt to send to Gemini
 * @returns {Promise<string>} - The generated content
 */
async function generateContent(prompt) {
  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });
    
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    throw new Error('Failed to generate content with AI');
  }
}

/**
 * Analyze CSV data using Gemini AI
 * @param {Array} csvData - Array of objects representing CSV data
 * @param {string} analysisType - Type of analysis to perform
 * @returns {Promise<Object>} - The analysis result
 */
async function analyzeCSVData(csvData, analysisType) {
  try {
    // Prepare sample data (limit to 100 rows to avoid token limits)
    const sampleData = csvData.slice(0, 100);
    
    let prompt;
    
    // Create appropriate prompt based on analysis type
    if (analysisType === 'boston_matrix') {
      prompt = `
        Analyze the following Nepali market data and create a Boston Matrix analysis.
        Categorize each product into one of the four quadrants: Stars, Cash Cows, Question Marks, or Dogs.
        For each product, provide a brief explanation of why it belongs in that category.
        
        Market Data:
        ${JSON.stringify(sampleData)}
        
        Format the response as a JSON object with the following structure:
        {
          "summary": "Overall analysis summary of the Nepali market",
          "items": [
            {
              "name": "Product Name",
              "category": "star|cashCow|questionMark|dog",
              "marketGrowth": "high|low",
              "marketShare": "high|low",
              "explanation": "Brief explanation"
            }
          ],
          "recommendations": {
            "stars": ["Recommendation 1", "Recommendation 2"],
            "cashCows": ["Recommendation 1", "Recommendation 2"],
            "questionMarks": ["Recommendation 1", "Recommendation 2"],
            "dogs": ["Recommendation 1", "Recommendation 2"]
          }
        }
      `;
    } else if (analysisType === 'niche_market') {
      prompt = `
        Analyze the following Nepali market data and identify potential niche markets.
        Focus on products with high ratings and positive reviews but potentially lower market share.
        
        Market Data:
        ${JSON.stringify(sampleData)}
        
        Format the response as a JSON object with the following structure:
        {
          "summary": "Overall niche market opportunities in Nepal",
          "nicheMarkets": [
            {
              "name": "Niche Market Name",
              "products": ["Product 1", "Product 2"],
              "targetAudience": "Description of target audience",
              "growthPotential": "high|medium|low",
              "competitionLevel": "high|medium|low",
              "entryBarriers": ["Barrier 1", "Barrier 2"],
              "marketingStrategies": ["Strategy 1", "Strategy 2"]
            }
          ],
          "recommendations": [
            "Recommendation 1",
            "Recommendation 2"
          ]
        }
      `;
    } else if (analysisType === 'product_prototype') {
      prompt = `
        Analyze the following Nepali market data and create product prototype suggestions.
        Focus on gaps in the market and opportunities for new products.
        
        Market Data:
        ${JSON.stringify(sampleData)}
        
        Format the response as a JSON object with the following structure:
        {
          "summary": "Overall product opportunities in the Nepali market",
          "prototypes": [
            {
              "name": "Product Name",
              "description": "Detailed description of the product",
              "targetMarket": "Description of target market",
              "keyFeatures": ["Feature 1", "Feature 2"],
              "valueProposition": "Unique value proposition",
              "pricingStrategy": "Suggested pricing approach",
              "developmentConsiderations": ["Consideration 1", "Consideration 2"]
            }
          ],
          "recommendations": [
            "Recommendation 1",
            "Recommendation 2"
          ]
        }
      `;
    } else if (analysisType === 'question_to_star') {
      prompt = `
        Analyze the following Nepali market data and identify Question Mark products that could be converted to Stars.
        Provide strategies for this conversion.
        
        Market Data:
        ${JSON.stringify(sampleData)}
        
        Format the response as a JSON object with the following structure:
        {
          "summary": "Overview of Question Mark to Star conversion opportunities",
          "questionMarkProducts": [
            {
              "name": "Product Name",
              "currentStatus": {
                "marketShare": "low",
                "marketGrowth": "high",
                "challenges": ["Challenge 1", "Challenge 2"]
              },
              "conversionStrategies": ["Strategy 1", "Strategy 2"],
              "investmentRequired": "high|medium|low",
              "timelineToStar": "short|medium|long",
              "riskAssessment": "high|medium|low"
            }
          ],
          "generalStrategies": [
            "Strategy 1",
            "Strategy 2"
          ]
        }
      `;
    } else {
      throw new Error(`Unsupported analysis type: ${analysisType}`);
    }
    
    // Generate content
    console.log(`Generating ${analysisType} analysis...`);
    const response = await generateContent(prompt);
    
    // Parse the response as JSON
    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.log('Raw response:', response);
      
      // Return a basic structure if parsing fails
      return {
        summary: `Analysis could not be properly generated. Please try again.`,
        error: true,
        rawResponse: response
      };
    }
  } catch (error) {
    console.error(`Error analyzing CSV data with Gemini for ${analysisType}:`, error);
    throw new Error(`Failed to analyze data with AI: ${error.message}`);
  }
}

/**
 * Main function to analyze Nepali market data
 */
async function analyzeNepaliMarketData() {
  try {
    const csvFilePath = path.join(__dirname, 'Nepali_Market_with_English_Reviews.csv');
    console.log(`Starting analysis of Nepali market data from: ${csvFilePath}`);
    
    // Read and parse the CSV file
    const data = await new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          console.log(`Successfully read ${results.length} rows from CSV file`);
          resolve(results);
        })
        .on('error', (error) => {
          console.error('Error reading CSV file:', error);
          reject(error);
        });
    });
    
    // Analyze data with different analysis types
    const bostonMatrix = await analyzeCSVData(data, 'boston_matrix');
    const nicheMarket = await analyzeCSVData(data, 'niche_market');
    const productPrototypes = await analyzeCSVData(data, 'product_prototype');
    const questionToStar = await analyzeCSVData(data, 'question_to_star');
    
    // Create results directory if it doesn't exist
    const resultsDir = path.join(__dirname, 'analysis_results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir);
    }
    
    // Save results to JSON files
    fs.writeFileSync(
      path.join(resultsDir, 'boston_matrix.json'),
      JSON.stringify(bostonMatrix, null, 2)
    );
    
    fs.writeFileSync(
      path.join(resultsDir, 'niche_market.json'),
      JSON.stringify(nicheMarket, null, 2)
    );
    
    fs.writeFileSync(
      path.join(resultsDir, 'product_prototypes.json'),
      JSON.stringify(productPrototypes, null, 2)
    );
    
    fs.writeFileSync(
      path.join(resultsDir, 'question_to_star.json'),
      JSON.stringify(questionToStar, null, 2)
    );
    
    console.log('Analysis completed successfully!');
    console.log(`Results saved to: ${resultsDir}`);
    
  } catch (error) {
    console.error('Error analyzing Nepali market data:', error);
  }
}

// Run the analysis
analyzeNepaliMarketData(); 