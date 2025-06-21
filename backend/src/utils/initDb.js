const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

/**
 * Initialize database with schema
 */
const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');
    
    // Read schema SQL file
    const schemaPath = path.join(__dirname, '../../db/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema SQL
    await pool.query(schemaSql);
    
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

/**
 * Check if database is initialized
 */
const isDatabaseInitialized = async () => {
  try {
    // Check if users table exists
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `);
    
    return result.rows[0].exists;
  } catch (error) {
    console.error('Error checking database initialization:', error);
    return false;
  }
};

/**
 * Create database if not exists
 */
const createDatabaseIfNotExists = async () => {
  try {
    const dbName = process.env.PGDATABASE || 'productioncoach';
    
    // Connect to postgres database to check if our database exists
    const client = await pool.connect();
    
    try {
      // Check if database exists
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM pg_database 
          WHERE datname = $1
        );
      `, [dbName]);
      
      const dbExists = result.rows[0].exists;
      
      if (!dbExists) {
        console.log(`Database ${dbName} does not exist, creating...`);
        // Create database
        await client.query(`CREATE DATABASE ${dbName};`);
        console.log(`Database ${dbName} created successfully`);
      }
    } finally {
      client.release();
    }
    
    return true;
  } catch (error) {
    console.error('Error creating database:', error);
    return false;
  }
};

module.exports = {
  initializeDatabase,
  isDatabaseInitialized,
  createDatabaseIfNotExists,
}; 