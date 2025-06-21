const db = require('../config/db');

class BusinessData {
  // Create new business data
  static async create(userId, dataName, dataType, dataContent) {
    try {
      // Validate inputs
      if (!userId) throw new Error('User ID is required');
      if (!dataName) throw new Error('Data name is required');
      if (!dataType) throw new Error('Data type is required');
      if (!dataContent) throw new Error('Data content is required');
      
      // Ensure dataContent is a string (PostgreSQL JSON type expects a string)
      let dataContentStr = dataContent;
      if (typeof dataContent === 'object') {
        dataContentStr = JSON.stringify(dataContent);
      }
      
      const result = await db.query(
        'INSERT INTO business_data (user_id, data_name, data_type, data_content) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, dataName, dataType, dataContentStr]
      );
      
      if (!result || !result.rows || result.rows.length === 0) {
        throw new Error('Database returned no results after insert');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating business data:', error);
      
      // Add more context to the error
      if (error.code === '23505') {
        // Unique constraint violation
        throw new Error(`Duplicate entry: ${error.detail || error.message}`);
      } else if (error.code === '23503') {
        // Foreign key constraint violation
        throw new Error(`Invalid reference: ${error.detail || error.message}`);
      } else if (error.code === '22P02') {
        // Invalid text representation (often JSON parsing issues)
        throw new Error(`Invalid data format: ${error.message}`);
      } else {
        throw error;
      }
    }
  }
  
  // Get all business data for a user
  static async getByUserId(userId) {
    try {
      const result = await db.query(
        'SELECT * FROM business_data WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error getting business data:', error);
      throw error;
    }
  }
  
  // Get business data by ID
  static async getById(id, userId) {
    try {
      const result = await db.query(
        'SELECT * FROM business_data WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error getting business data by ID:', error);
      throw error;
    }
  }
  
  // Get business data by type
  static async getByType(userId, dataType) {
    try {
      const result = await db.query(
        'SELECT * FROM business_data WHERE user_id = $1 AND data_type = $2 ORDER BY created_at DESC',
        [userId, dataType]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error getting business data by type:', error);
      throw error;
    }
  }
  
  // Update business data
  static async update(id, userId, dataName, dataContent) {
    try {
      const result = await db.query(
        'UPDATE business_data SET data_name = $1, data_content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4 RETURNING *',
        [dataName, dataContent, id, userId]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating business data:', error);
      throw error;
    }
  }
  
  // Delete business data
  static async delete(id, userId) {
    try {
      await db.query(
        'DELETE FROM business_data WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting business data:', error);
      throw error;
    }
  }
}

module.exports = BusinessData; 