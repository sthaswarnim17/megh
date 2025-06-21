const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Process a CSV file using the Python ball.py script
 * @param {string} csvFilePath - Path to the CSV file
 * @param {string} outputDir - Directory where output files will be saved
 * @returns {Promise<{imagePath: string, summaryData: object}>}
 */
async function processBCGMatrix(csvFilePath, outputDir = './temp/output') {
  return new Promise((resolve, reject) => {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate unique output filename
    const timestamp = Date.now();
    const outputFilePath = path.join(outputDir, `bcg_matrix_${timestamp}.png`);
    
    console.log(`Processing BCG matrix: ${csvFilePath}`);
    console.log(`Output will be saved to: ${outputFilePath}`);
    
    // Check if input file exists and has content
    try {
      if (!fs.existsSync(csvFilePath)) {
        return reject(new Error(`Input file does not exist: ${csvFilePath}`));
      }
      
      const stats = fs.statSync(csvFilePath);
      if (stats.size === 0) {
        return reject(new Error(`Input file is empty: ${csvFilePath}`));
      }
      
      // Check if file is readable and has valid CSV format
      const firstFewLines = fs.readFileSync(csvFilePath, 'utf8', { encoding: 'utf8' }).slice(0, 500);
      if (!firstFewLines.includes(',')) {
        return reject(new Error(`Input file does not appear to be a valid CSV: ${csvFilePath}`));
      }
    } catch (fsError) {
      return reject(new Error(`Error reading input file: ${fsError.message}`));
    }
    
    // Run Python script with timeout
    const pythonProcess = spawn('python', [
      path.join(__dirname, 'ball.py'),
      csvFilePath,
      outputFilePath
    ]);
    
    let pythonOutput = '';
    let pythonErrors = '';
    
    // Set a timeout to kill the process if it takes too long
    const timeoutMs = 60000; // 60 seconds
    const timeout = setTimeout(() => {
      console.error(`Python process timed out after ${timeoutMs/1000} seconds`);
      pythonProcess.kill();
      reject(new Error('Analysis timed out. The file may be too large or complex to process.'));
    }, timeoutMs);
    
    // Collect data from stdout
    pythonProcess.stdout.on('data', (data) => {
      const dataStr = data.toString();
      pythonOutput += dataStr;
      console.log(`Python output: ${dataStr}`);
    });
    
    // Collect errors from stderr
    pythonProcess.stderr.on('data', (data) => {
      const dataStr = data.toString();
      pythonErrors += dataStr;
      console.error(`Python error: ${dataStr}`);
    });
    
    // Handle process completion
    pythonProcess.on('close', (code) => {
      clearTimeout(timeout);
      
      if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
        
        // Create a more user-friendly error message based on common errors
        let errorMessage = `Python script failed: ${pythonErrors}`;
        
        if (pythonErrors.includes('Error tokenizing data') || pythonErrors.includes('EOF inside string')) {
          errorMessage = 'CSV parsing error: The file contains improperly formatted data. Please check for unclosed quotes or special characters.';
        } else if (pythonErrors.includes('could not convert string to float')) {
          errorMessage = 'Data format error: Some numeric values in your CSV are not properly formatted.';
        }
        
        return reject(new Error(errorMessage));
      }
      
      // Read summary data from JSON file
      const summaryPath = outputFilePath.replace('.png', '_summary.json');
      if (!fs.existsSync(summaryPath)) {
        return reject(new Error('Summary file not found. Analysis may have failed silently.'));
      }
      
      // Check if image was created
      if (!fs.existsSync(outputFilePath)) {
        return reject(new Error('Image file not found. Analysis may have failed silently.'));
      }
      
      try {
        const summaryData = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
        
        // Validate summary data structure
        if (!summaryData.thresholds || !summaryData.counts) {
          return reject(new Error('Generated summary data is incomplete or invalid.'));
        }
        
        // Convert image to base64
        const imageBuffer = fs.readFileSync(outputFilePath);
        const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
        
        resolve({
          imagePath: outputFilePath,
          imageBase64: base64Image,
          summaryData
        });
      } catch (error) {
        reject(new Error(`Error processing analysis results: ${error.message}`));
      }
    });
    
    // Handle process error (e.g., Python not found)
    pythonProcess.on('error', (error) => {
      clearTimeout(timeout);
      console.error('Failed to start Python process:', error);
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
}

module.exports = { processBCGMatrix }; 