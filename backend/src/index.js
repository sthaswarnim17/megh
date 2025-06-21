const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const businessDataRoutes = require('./routes/businessDataRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const bcgMatrixRoutes = require('./routes/bcgMatrixRoutes');

// Initialize express
const app = express();

// Middleware
app.use(cors());
// Increase JSON payload size limit to 50MB (default is 100KB)
app.use(express.json({ limit: '50mb' }));
// Increase URL-encoded payload size limit to 50MB
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// File upload middleware
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  useTempFiles: false,
  abortOnLimit: true,
  responseOnLimit: 'File size limit has been reached'
}));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/business-data', businessDataRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/bcg-matrix', bcgMatrixRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'ProductionCoach API is running...' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;