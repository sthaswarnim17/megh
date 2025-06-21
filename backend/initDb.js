const dotenv = require('dotenv');
const { createDatabaseIfNotExists, initializeDatabase, isDatabaseInitialized } = require('./src/utils/initDb');

// Load environment variables
dotenv.config();

const init = async () => {
  try {
    // Create database if it doesn't exist
    await createDatabaseIfNotExists();
    
    // Check if database is initialized
    const isInitialized = await isDatabaseInitialized();
    
    if (!isInitialized) {
      // Initialize database
      await initializeDatabase();
      console.log('Database initialization completed successfully');
    } else {
      console.log('Database is already initialized');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

init(); 