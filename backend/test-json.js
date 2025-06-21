// Test script to verify that the backend is returning valid JSON
const axios = require('axios');

// Test the createAnalysis endpoint
async function testCreateAnalysis() {
  try {
    console.log('Testing createAnalysis endpoint...');
    
    // Mock data for testing
    const testData = {
      dataId: 1, // Replace with a valid data ID from your database
      analysisType: 'strategy_draft_test',
      analysisContent: JSON.stringify({
        strategy: {
          name: 'Test Strategy',
          type: 'Test',
          status: 'Draft',
          progress: 0
        }
      })
    };
    
    // Replace with a valid token from your database
    const token = 'your_auth_token_here';
    
    // Make the request
    const response = await axios.post('http://localhost:5000/api/analysis', testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    // Verify that the response is valid JSON
    if (typeof response.data === 'object') {
      console.log('✓ Response is valid JSON');
    } else {
      console.error('✗ Response is not valid JSON');
    }
  } catch (error) {
    console.error('Error testing createAnalysis:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data);
    }
  }
}

// Test the getAnalysisByType endpoint
async function testGetAnalysisByType() {
  try {
    console.log('\nTesting getAnalysisByType endpoint...');
    
    // Replace with a valid token from your database
    const token = 'your_auth_token_here';
    
    // Make the request
    const response = await axios.get('http://localhost:5000/api/analysis/type/strategy_draft', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response data (first item):', response.data.length > 0 ? JSON.stringify(response.data[0], null, 2) : 'No items');
    
    // Verify that the response is valid JSON
    if (Array.isArray(response.data)) {
      console.log('✓ Response is valid JSON array');
    } else {
      console.error('✗ Response is not a valid JSON array');
    }
  } catch (error) {
    console.error('Error testing getAnalysisByType:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the tests
async function runTests() {
  await testCreateAnalysis();
  await testGetAnalysisByType();
}

runTests(); 