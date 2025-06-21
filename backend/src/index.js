const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Initialize Google Generative AI
// Use a test API key for demo purposes if none is provided in environment
const DEMO_API_KEY = "AIzaSyDdu0AHh87dCI4q4nj-o5D3zBc6UPGC-Y0"; // This is a placeholder and won't work - replace with your actual key for testing
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || DEMO_API_KEY);
global.genAI = genAI;

// Log API key status
console.log(`Google Generative AI initialized: ${process.env.GOOGLE_API_KEY ? 'Using environment API key' : 'Using demo/fallback API key - PLEASE SET GOOGLE_API_KEY IN ENVIRONMENT FOR PRODUCTION'}`);

// API Configuration for Gemini
console.log("Available API models:", genAI.listModels ? "API configured correctly" : "API configuration issue!");

// Import routes
const userRoutes = require('./routes/userRoutes');
const businessDataRoutes = require('./routes/businessDataRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const bcgMatrixRoutes = require('./routes/bcgMatrixRoutes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
// Authentication middleware disabled for demo

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(cors());

// Static files for temporary access
app.use('/temp', express.static(path.join(__dirname, '../../temp')));

// Routes - no authentication for demo
app.use('/api/users', userRoutes);
app.use('/api/business-data', businessDataRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/bcg-matrix', bcgMatrixRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;